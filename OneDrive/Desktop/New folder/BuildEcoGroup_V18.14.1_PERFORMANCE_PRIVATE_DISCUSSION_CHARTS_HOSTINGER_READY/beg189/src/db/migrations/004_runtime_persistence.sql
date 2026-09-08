CREATE TABLE IF NOT EXISTS app_runtime_state (
  state_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
