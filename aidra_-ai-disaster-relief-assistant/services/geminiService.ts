
import { GoogleGenAI, Type } from "@google/genai";
import { NewsUpdate, HistoricalDisaster, BudgetPrediction, DisasterZone, ZoneType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility to clean AI response if it contains markdown code blocks
const cleanAIJsonResponse = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export interface IndiaLocationData {
  name: string;
  state: string;
  district: string;
  pinCode: string;
  lat: string;
  lng: string;
  famousPlaces: string[];
  population: string;
  languages: string[];
  timeZone: string;
  weatherOverview: string;
  nearbyHospitals: string[];
  nearbyPoliceStations: string[];
  sources?: { title: string; uri: string }[];
}

export interface MapGroundingResult {
  text: string;
  links: { title: string; uri: string }[];
}

export interface IncidentAnalysis {
  severity: string;
  summary: string;
  safetySteps: string[];
  estimatedImpact: string;
}

export const getAIGeneratedAlerts = async (location: string): Promise<NewsUpdate[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 realistic disaster management news updates for ${location}. Include one URGENT, one UPDATE, and one ADVISORY. Return as a JSON array of objects with fields: id, title, timestamp, category (URGENT, UPDATE, or ADVISORY), and content.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              category: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["id", "title", "timestamp", "category", "content"]
          }
        }
      }
    });

    const text = cleanAIJsonResponse(response.text || "[]");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching AI alerts:", error);
    return [];
  }
};

export const generateAreaRiskZones = async (location: string): Promise<{ center: [number, number], zones: DisasterZone[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the geography of "${location}" in India. Provide its center coordinates [lat, lng] and 4-5 simulated disaster risk zones (Red for critical danger, Yellow for relief/warning, Green for safe zones). Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            center: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            zones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["RED", "YELLOW", "GREEN"] },
                  coordinates: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  radius: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "name", "type", "coordinates", "radius", "description", "instructions"]
              }
            }
          },
          required: ["center", "zones"]
        }
      }
    });

    const text = cleanAIJsonResponse(response.text || "{}");
    const data = JSON.parse(text);
    return {
      center: data.center ? [data.center[0], data.center[1]] : [20.5937, 78.9629],
      zones: data.zones || []
    };
  } catch (error) {
    console.error("Risk zone generation failed:", error);
    return { center: [20.5937, 78.9629], zones: [] };
  }
};

export const predictDisasterBudget = async (
  historicalData: HistoricalDisaster[],
  targetType: string,
  targetPopulation: number,
  targetArea: string,
  targetSeverity: string,
  targetDuration: number
): Promise<BudgetPrediction> => {
  try {
    const context = JSON.stringify(historicalData);
    const prompt = `Task: Act as a high-fidelity Multi-Output Random Forest Regressor & Bayesian Econometrician for the AIDRA platform.
Data Context (Audit History): ${context}.

Objective: Predict 8 discrete budget categories for a NEW scenario.
SCENARIO:
- Event: ${targetType}
- Severity: ${targetSeverity} (Scale logic: Critical=2.5x, High=1.8x, Med=1.2x, Low=0.8x base)
- Impacted Pop: ${targetPopulation}
- Forecast Duration: ${targetDuration} days
- Region: ${targetArea}

Analysis Protocol:
1. Normalization: Calculate mean cost-per-capita-per-day from history for each category.
2. Feature Engineering: Scale the coefficients based on ${targetSeverity} and ${targetType} characteristics.
3. Regression: Perform a multi-output forecast for: Food, Water, Shelter, Rescue, Medical, Logistics, Comm, Rehab.
4. Total = Sum of outputs.

Return STRICT JSON:
- predictedTotal: (number, integer)
- breakdown: { food: number, water: number, shelter: number, rescue: number, medical: number, logistics: number, comm: number, rehab: number }
- reasoning: (Professional mathematical derivation explanation)
- confidenceScore: (0.0 to 1.0)
- keyFactors: (Array of strings identifying primary cost drivers)
- executiveBriefing: (2-paragraph professional summary for Treasury/Ministry officials)`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedTotal: { type: Type.NUMBER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                food: { type: Type.NUMBER },
                water: { type: Type.NUMBER },
                shelter: { type: Type.NUMBER },
                rescue: { type: Type.NUMBER },
                medical: { type: Type.NUMBER },
                logistics: { type: Type.NUMBER },
                comm: { type: Type.NUMBER },
                rehab: { type: Type.NUMBER }
              }
            },
            reasoning: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            keyFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            executiveBriefing: { type: Type.STRING }
          },
          required: ["predictedTotal", "breakdown", "reasoning", "confidenceScore", "keyFactors", "executiveBriefing"]
        }
      }
    });

    const text = cleanAIJsonResponse(response.text || "{}");
    const data = JSON.parse(text);
    return {
      predictedTotal: data.predictedTotal || 0,
      breakdown: data.breakdown || { food: 0, water: 0, shelter: 0, rescue: 0, medical: 0, logistics: 0, comm: 0, rehab: 0 },
      reasoning: data.reasoning || "Derivation complete based on historical baseline.",
      confidenceScore: data.confidenceScore || 0,
      keyFactors: data.keyFactors || [],
      executiveBriefing: data.executiveBriefing || "Forecast generated for strategic review."
    };
  } catch (error) {
    console.error("Budget prediction failed:", error);
    throw error;
  }
};

export const budgetChatInteraction = async (
  message: string,
  historicalData: HistoricalDisaster[],
  currentPrediction?: BudgetPrediction | null
): Promise<string> => {
  try {
    const historyContext = historicalData.length > 0 
      ? `Historical Context (Audit History): ${JSON.stringify(historicalData)}` 
      : "No historical audit data uploaded.";
    
    const predictionContext = currentPrediction 
      ? `Active Forecast Result: ${JSON.stringify(currentPrediction)}` 
      : "No forecast active.";

    const prompt = `You are the "AIDRA Strategic Fiscal Advisor".
You help government officials understand disaster budget forecasts.

CONTEXT:
${historyContext}
${predictionContext}

USER QUERY: "${message}"

GUIDELINES:
1. Reference specific ₹ values in bold.
2. Use professional, authoritative tone.
3. Be concise and structured.
4. If asked about methodology, explain it's based on Multi-Output Regression of local history.

FORMAT: Markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Communication with fiscal node interrupted.";
  } catch (error) {
    console.error("Budget chat error:", error);
    return "Error communicating with the fiscal advisor node.";
  }
};

export const getIndiaLocationDetails = async (location: string): Promise<IndiaLocationData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for details for location "${location}" in India. Return as JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            state: { type: Type.STRING },
            district: { type: Type.STRING },
            pinCode: { type: Type.STRING },
            lat: { type: Type.STRING },
            lng: { type: Type.STRING },
            famousPlaces: { type: Type.ARRAY, items: { type: Type.STRING } },
            population: { type: Type.STRING },
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            timeZone: { type: Type.STRING },
            weatherOverview: { type: Type.STRING },
            nearbyHospitals: { type: Type.ARRAY, items: { type: Type.STRING } },
            nearbyPoliceStations: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = cleanAIJsonResponse(response.text || "{}");
    const rawData = JSON.parse(text);
    const data: IndiaLocationData = {
      name: rawData.name || "Unknown",
      state: rawData.state || "Unknown",
      district: rawData.district || "Unknown",
      pinCode: rawData.pinCode || "",
      lat: rawData.lat || "",
      lng: rawData.lng || "",
      famousPlaces: rawData.famousPlaces || [],
      population: rawData.population || "Unknown",
      languages: rawData.languages || [],
      timeZone: rawData.timeZone || "IST",
      weatherOverview: rawData.weatherOverview || "No data available",
      nearbyHospitals: rawData.nearbyHospitals || [],
      nearbyPoliceStations: rawData.nearbyPoliceStations || []
    };
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    data.sources = chunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
    return data;
  } catch (error) {
    console.error("India location lookup failed:", error);
    throw error;
  }
};

export const searchNearbyPlaces = async (query: string, lat: number, lng: number): Promise<MapGroundingResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }));
    return { text: response.text || "No results found.", links };
  } catch (error) {
    return { text: "Search failed.", links: [] };
  }
};

export const getEmergencyServicesInIndia = async (location: string, type: string): Promise<MapGroundingResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find ${type} in ${location}, India.`,
      config: { tools: [{ googleMaps: {} }] },
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }));
    return { text: response.text || "No facilities found.", links };
  } catch (error) {
    return { text: "Lookup failed.", links: [] };
  }
};

export const analyzeIncidentImage = async (base64Image: string, mimeType: string): Promise<IncidentAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType } },
          { text: "Analyze the severity of this disaster-related incident. Return JSON with severity, summary, safetySteps, and estimatedImpact." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING },
            summary: { type: Type.STRING },
            safetySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedImpact: { type: Type.STRING }
          }
        }
      }
    });
    const text = cleanAIJsonResponse(response.text || "{}");
    const data = JSON.parse(text);
    return {
      severity: data.severity || "Unknown",
      summary: data.summary || "No analysis available",
      safetySteps: data.safetySteps || [],
      estimatedImpact: data.estimatedImpact || "Impact assessment not possible"
    };
  } catch (error) {
    console.error("Image analysis failed:", error);
    throw error;
  }
};
