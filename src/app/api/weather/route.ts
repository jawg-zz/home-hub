import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { monitoring } from "@/lib/monitoring";

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const DEFAULT_LATITUDE = -1.2921;
const DEFAULT_LONGITUDE = 36.8219;

export async function GET() {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      logger.warn("Unauthorized weather access", { requestId });
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
    }

    const weatherData = await monitoring.trackPerformance(
      "weather-fetch",
      async () => {
        const url = new URL(OPEN_METEO_BASE_URL);
        url.searchParams.set("latitude", DEFAULT_LATITUDE.toString());
        url.searchParams.set("longitude", DEFAULT_LONGITUDE.toString());
        url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
        url.searchParams.set("timezone", "auto");

        const response = await fetch(url.toString(), {
          next: { revalidate: 600 },
        });

        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        const weatherCode = data.current?.weather_code ?? 0;
        const condition = getWeatherCondition(weatherCode);

        return {
          temperature: Math.round(data.current?.temperature_2m ?? 0),
          humidity: Math.round(data.current?.relative_humidity_2m ?? 0),
          feelsLike: Math.round(data.current?.apparent_temperature ?? 0),
          windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
          condition,
          location: "Nairobi, Kenya",
          icon: getWeatherIcon(weatherCode),
        };
      },
      { requestId, userId: session.user.id },
    );

    return NextResponse.json(weatherData);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/weather", method: "GET", requestId },
    );
    logger.error("Weather fetch failed", { requestId, error });
    return NextResponse.json(
      createErrorResponse("Failed to fetch weather data", 500),
      { status: 500 },
    );
  }
}

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Showers",
    81: "Showers",
    82: "Violent Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Heavy Hail",
  };
  return conditions[code] ?? "Unknown";
}

function getWeatherIcon(code: number): string {
  const icons: Record<number, string> = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌧️",
    53: "🌧️",
    55: "🌧️",
    61: "🌧️",
    63: "🌧️",
    65: "🌧️",
    71: "❄️",
    73: "❄️",
    75: "❄️",
    77: "❄️",
    80: "🌦️",
    81: "🌦️",
    82: "🌦️",
    85: "🌨️",
    86: "🌨️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
  };
  return icons[code] ?? "🌡️";
}
