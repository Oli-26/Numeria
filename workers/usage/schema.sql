-- One row per day and event key, holding only a running total. Nothing about who sent it.
CREATE TABLE IF NOT EXISTS counts (
  day TEXT NOT NULL,
  key TEXT NOT NULL,
  n INTEGER NOT NULL,
  PRIMARY KEY (day, key)
);
