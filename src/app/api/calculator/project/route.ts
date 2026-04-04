/**
 * Calculator Projection API
 *
 * POST /api/calculator/project
 */

import { NextRequest, NextResponse } from "next/server"

import {
  calculateBoutiqueProjection,
  calculateCafeProjection,
  calculateCreatorProjection,
  calculateLocalCommerceProjection,
  calculateRestaurantProjection,
} from "@/lib/cardin/sector-calculator"
import type {
  BoutiqueCalculatorInput,
  CafeCalculatorInput,
  ConcreteProjection,
  CreatorCalculatorInput,
  LocalCommerceCalculatorInput,
  RestaurantCalculatorInput,
} from "@/types/cardin-core.types"

type CalculatorRequest =
  | { sector: "cafe"; input: CafeCalculatorInput }
  | { sector: "restaurant"; input: RestaurantCalculatorInput }
  | { sector: "local"; input: LocalCommerceCalculatorInput }
  | { sector: "creator"; input: CreatorCalculatorInput }
  | { sector: "boutique"; input: BoutiqueCalculatorInput }

export async function POST(request: NextRequest): Promise<NextResponse<ConcreteProjection | { error: string }>> {
  try {
    const body = (await request.json()) as CalculatorRequest

    if (!body.sector || !body.input) {
      return NextResponse.json({ error: "Missing sector or input" }, { status: 400 })
    }

    let projection: ConcreteProjection

    switch (body.sector) {
      case "cafe":
        projection = calculateCafeProjection(body.input as CafeCalculatorInput)
        break

      case "restaurant":
        projection = calculateRestaurantProjection(body.input as RestaurantCalculatorInput)
        break

      case "local":
        projection = calculateLocalCommerceProjection(body.input as LocalCommerceCalculatorInput)
        break

      case "creator":
        projection = calculateCreatorProjection(body.input as CreatorCalculatorInput)
        break

      case "boutique":
        projection = calculateBoutiqueProjection(body.input as BoutiqueCalculatorInput)
        break

      default:
        return NextResponse.json({ error: `Unknown sector: ${(body as { sector?: string }).sector}` }, { status: 400 })
    }

    return NextResponse.json(projection, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Calculator projection error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Calculation failed" },
      { status: 500 }
    )
  }
}
