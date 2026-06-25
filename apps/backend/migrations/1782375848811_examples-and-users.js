/** @param {import("node-pg-migrate").MigrationBuilder} pgm */
module.exports.up = (pgm) => {
  pgm.createTable("examples", {
    id: { type: "uuid", primaryKey: true },
    name: { type: "text", notNull: true },
    description: { type: "text", notNull: true, default: "" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createTable("users", {
    id: { type: "uuid", primaryKey: true },
    name: { type: "text", notNull: true },
    email: { type: "text", notNull: true, unique: true },
    role: { type: "text", notNull: true, default: "viewer", check: "role IN ('admin', 'editor', 'viewer')" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createIndex("users", "email", { name: "idx_users_email" });
};

/** @param {import("node-pg-migrate").MigrationBuilder} pgm */
module.exports.down = (pgm) => {
  pgm.dropTable("users");
  pgm.dropTable("examples");
};
