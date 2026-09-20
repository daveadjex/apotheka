"""inventory, pos, employee, and audit tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

rx_status_enum = postgresql.ENUM(
    "pending_verification", "verified", "filled", "dispensed", "rejected",
    name="rx_status",
)


def upgrade() -> None:
    rx_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "drugs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("ndc_code", sa.String, nullable=False, unique=True),
        sa.Column("generic_name", sa.String, nullable=False),
        sa.Column("brand_name", sa.String, nullable=True),
        sa.Column("dosage_form", sa.String, nullable=True),
        sa.Column("strength", sa.String, nullable=True),
        sa.Column("controlled_substance_schedule", sa.String, nullable=True),
        sa.Column("requires_rx", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.execute("CREATE INDEX idx_drugs_generic_trgm ON drugs USING gin (generic_name gin_trgm_ops)")
    op.execute("CREATE INDEX idx_drugs_brand_trgm ON drugs USING gin (brand_name gin_trgm_ops)")

    op.create_table(
        "suppliers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("contact_email", sa.String, nullable=True),
        sa.Column("contact_phone", sa.String, nullable=True),
        sa.Column("lead_time_days", sa.Integer, server_default="3"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_suppliers_tenant", "suppliers", ["tenant_id"])

    op.create_table(
        "inventory_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("drug_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("drugs.id"), nullable=False),
        sa.Column("supplier_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("suppliers.id"), nullable=True),
        sa.Column("batch_number", sa.String, nullable=False),
        sa.Column("quantity_on_hand", sa.Integer, server_default="0"),
        sa.Column("reorder_threshold", sa.Integer, server_default="10"),
        sa.Column("reorder_quantity", sa.Integer, server_default="50"),
        sa.Column("unit_cost", sa.Numeric(10, 2), nullable=True),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("expiry_date", sa.Date, nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_inventory_tenant_branch", "inventory_items", ["tenant_id", "branch_id"])
    op.create_index("idx_inventory_drug", "inventory_items", ["drug_id"])
    op.execute("CREATE INDEX idx_inventory_expiry ON inventory_items(expiry_date) WHERE quantity_on_hand > 0")
    op.execute("CREATE INDEX idx_inventory_low_stock ON inventory_items(branch_id, quantity_on_hand) WHERE quantity_on_hand > 0")

    op.create_table(
        "purchase_orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supplier_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("suppliers.id"), nullable=False),
        sa.Column("status", sa.String, server_default="draft"),
        sa.Column("is_auto_generated", sa.Boolean, server_default=sa.false()),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_po_tenant_branch", "purchase_orders", ["tenant_id", "branch_id"])

    op.create_table(
        "purchase_order_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("purchase_order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("drug_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("drugs.id"), nullable=False),
        sa.Column("quantity_ordered", sa.Integer, nullable=False),
        sa.Column("unit_cost", sa.Numeric(10, 2), nullable=True),
    )
    op.create_index("idx_poi_po", "purchase_order_items", ["purchase_order_id"])

    op.create_table(
        "patients",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("full_name", sa.String, nullable=False),
        sa.Column("phone", sa.String, nullable=True),
        sa.Column("email", sa.String, nullable=True),
        sa.Column("allergies", postgresql.ARRAY(sa.String), nullable=True),
        sa.Column("insurance_provider", sa.String, nullable=True),
        sa.Column("insurance_member_id", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_patients_tenant", "patients", ["tenant_id"])
    op.execute("CREATE INDEX idx_patients_name_trgm ON patients USING gin (full_name gin_trgm_ops)")

    op.create_table(
        "prescriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("drug_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("drugs.id"), nullable=False),
        sa.Column("prescriber_name", sa.String, nullable=False),
        sa.Column("prescriber_npi", sa.String, nullable=True),
        sa.Column("dosage_instructions", sa.String, nullable=False),
        sa.Column("quantity_prescribed", sa.Integer, nullable=False),
        sa.Column("refills_remaining", sa.Integer, server_default="0"),
        sa.Column("status", rx_status_enum, server_default="pending_verification"),
        sa.Column("verified_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_rx_tenant_branch", "prescriptions", ["tenant_id", "branch_id"])
    op.create_index("idx_rx_patient", "prescriptions", ["patient_id"])
    op.execute("CREATE INDEX idx_rx_status ON prescriptions(status) WHERE status IN ('pending_verification','verified')")

    op.create_table(
        "sales",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cashier_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=True),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("insurance_covered", sa.Numeric(10, 2), server_default="0"),
        sa.Column("patient_copay", sa.Numeric(10, 2), server_default="0"),
        sa.Column("tax", sa.Numeric(10, 2), server_default="0"),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column("payment_method", sa.String, nullable=False),
        sa.Column("offline_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_sales_tenant_branch_time", "sales", ["tenant_id", "branch_id", "created_at"])
    op.create_index("idx_sales_cashier", "sales", ["cashier_id"])

    op.create_table(
        "sale_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("sale_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sales.id", ondelete="CASCADE"), nullable=False),
        sa.Column("inventory_item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("inventory_items.id"), nullable=False),
        sa.Column("prescription_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("prescriptions.id"), nullable=True),
        sa.Column("quantity", sa.Integer, nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("line_total", sa.Numeric(10, 2), nullable=False),
    )
    op.create_index("idx_sale_items_sale", "sale_items", ["sale_id"])

    op.create_table(
        "shifts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_ai_suggested", sa.Boolean, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_shifts_branch_time", "shifts", ["branch_id", "starts_at"])
    op.create_index("idx_shifts_user", "shifts", ["user_id"])

    op.create_table(
        "performance_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("metric_date", sa.Date, nullable=False),
        sa.Column("prescriptions_filled", sa.Integer, server_default="0"),
        sa.Column("avg_checkout_seconds", sa.Numeric(6, 2), nullable=True),
        sa.Column("sales_total", sa.Numeric(10, 2), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "metric_date", name="uq_perf_user_date"),
    )
    op.create_index("idx_perf_tenant_date", "performance_metrics", ["tenant_id", "metric_date"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.String, nullable=False),
        sa.Column("entity_type", sa.String, nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("audit_metadata", postgresql.JSONB, server_default="{}"),
        sa.Column("ip_address", postgresql.INET, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_audit_tenant_time", "audit_logs", ["tenant_id", "created_at"])
    op.create_index("idx_audit_entity", "audit_logs", ["entity_type", "entity_id"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("performance_metrics")
    op.drop_table("shifts")
    op.drop_table("sale_items")
    op.drop_table("sales")
    op.drop_table("prescriptions")
    op.drop_table("patients")
    op.drop_table("purchase_order_items")
    op.drop_table("purchase_orders")
    op.drop_table("inventory_items")
    op.drop_table("suppliers")
    op.drop_table("drugs")
    rx_status_enum.drop(op.get_bind(), checkfirst=True)
