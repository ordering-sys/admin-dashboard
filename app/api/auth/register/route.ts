import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { getCurrentUser } from '@/lib/current-user';
import { isRole } from '@/lib/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const actor = await getCurrentUser();
    if (actor?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { email, password, name, role } = await request.json();

    // Validate input
    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string' || !email.trim() || !name.trim() || !isRole(role)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data, error } = await supabase
      .from("admin_users")
      .insert([
        {
          email: email.trim().toLowerCase(),
          password_hash,
          name: name.trim(),
          role,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Registration error:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User created successfully", userId: data.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
