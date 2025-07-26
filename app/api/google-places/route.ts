import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = "AIzaSyBaCRiL9b87UdAibEPvoiKleno7wFDanlY";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");
  const place_id = searchParams.get("place_id");

  if (input) {
    // Autocomplete
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } else if (place_id) {
    // Place details
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      place_id
    )}&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } else {
    return NextResponse.json({ error: "Missing input or place_id" }, { status: 400 });
  }
} 