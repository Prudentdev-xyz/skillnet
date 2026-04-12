import { supabase } from "./supabase.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Seller address is required",
      });
    }

    const { data, error } = await supabase
      .from("skills")
      .select("id, name, category, price_usdc, downloads, rating, created_at")
      .eq("seller_address", address)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const totalDownloads = data.reduce((acc, s) => acc + s.downloads, 0);
    const totalEarnings = data.reduce(
      (acc, s) => acc + s.downloads * s.price_usdc,
      0
    );

    return res.status(200).json({
      success: true,
      address,
      totalSkills: data.length,
      totalDownloads,
      totalEarnings: totalEarnings.toFixed(4),
      skills: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}