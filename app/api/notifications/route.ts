import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase =
      await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "Notification API authentication failed",
        {
          message: authError?.message ?? null,
          status: authError?.status ?? null,
        },
      );

      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        title,
        message,
        type,
        priority,
        link,
        read_at,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (error) {
      console.error(
        "Failed to load notifications",
        {
          userId: user.id,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      );

      return NextResponse.json(
        {
          message:
            "Failed to load notifications.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      notifications: data ?? [],
    });
  } catch (error) {
    console.error(
      "Unexpected notifications API error",
      {
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
    );

    return NextResponse.json(
      {
        message:
          "Failed to load notifications.",
      },
      {
        status: 500,
      },
    );
  }
}