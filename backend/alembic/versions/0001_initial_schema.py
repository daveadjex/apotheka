"""initial schema - tenants and users

Revision ID: 0001
Revises:
Create Date: 2026-08-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

user_role_enum = postgresql.ENUM(
    "super_admin",
    "pharmacy_owner",
    "pharmacist",
    "cashier",
    "inventory_manager",
    name="user_role",
)


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    user_role_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "tenants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                   server_default=sa.text("uuid_generate_v4()")),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("slug", sa.String, nullable=False, unique=True),
        sa.Column("subscription_tier", sa.String, nullable=False, server_default="standard"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                   server_default=sa.text("uuid_generate_v4()")),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True),
                   sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("email", sa.String, nullable=False, unique=True),
        sa.Column("hashed_password", sa.String, nullable=False),
        sa.Column("full_name", sa.String, nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("license_number", sa.String, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_users_tenant", "users", ["tenant_id"])
    op.create_index("idx_users_branch", "users", ["branch_id"])
    op.create_index("idx_users_email", "users", ["email"])


def downgrade() -> None:
    op.drop_index("idx_users_email", table_name="users")
    op.drop_index("idx_users_branch", table_name="users")
    op.drop_index("idx_users_tenant", table_name="users")
    op.drop_table("users")
    op.drop_table("tenants")
    user_role_enum.drop(op.get_bind(), checkfirst=True)
