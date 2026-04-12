/* eslint-disable no-undef */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      short_description,
      full_description,
      category,
      price_usdc,
      seller_address,
      file_url,
    } = req.body;

    // Validate required fields
    if (!name || !short_description || !full_description || !category || !price_usdc || !seller_address) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("skills")
      .insert([
        {
          name,
          short_description,
          full_description,
          category,
          price_usdc: parseFloat(price_usdc),
          seller_address,
          file_url: file_url || null,
          downloads: 0,
          rating: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      skill: data,
    });
  } catch (err) {
    console.error("List skill error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}