import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({
      orderBy: { created_at: "desc" },
    });

    return Response.json({
      reminders: reminders.map((r) => ({
        id: r.id,
        text_paraphrase: r.text_paraphrase,
        source_type: r.source_type,
        reference: r.reference,
        authenticity_note: r.authenticity_note,
        category: r.category,
        enabled: r.enabled,
        is_custom: r.is_custom,
        pool: r.category === "istiqamah" || r.category === "sabr" || r.category === "self_change"
          ? "steadfastness"
          : r.category === "provision" || r.category === "trust" || r.category === "rizq" || r.category === "discipline" || r.category === "knowledge"
          ? "purpose"
          : "motivation",
      })),
    });
  } catch (error) {
    console.error("Reminders API error:", error);
    return Response.json(
      { error: "Failed to fetch reminders" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "toggle") {
      const current = await prisma.reminder.findUnique({
        where: { id: body.id },
      });
      if (!current) {
        return Response.json({ error: "Reminder not found" }, { status: 404 });
      }
      const updated = await prisma.reminder.update({
        where: { id: body.id },
        data: { enabled: !current.enabled },
      });
      return Response.json({ reminder: updated });
    }

    if (body.action === "create") {
      const { text_paraphrase, source_type, reference, category, pool } = body;

      if (!text_paraphrase || !source_type || !reference) {
        return Response.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      const reminder = await prisma.reminder.create({
        data: {
          text_paraphrase,
          source_type,
          reference,
          category: category || "custom",
          is_custom: true,
          enabled: true,
        },
      });

      return Response.json({ reminder });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Reminders API error:", error);
    return Response.json(
      { error: "Failed to process reminder" },
      { status: 500 },
    );
  }
}
