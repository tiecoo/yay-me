-- user_id NULL = a default category shared by every account. Per-user custom
-- categories are schema-ready via user_id but there is no UI for them yet.
CREATE TABLE categories (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
  slug    TEXT NOT NULL,
  label   TEXT NOT NULL,
  icon    TEXT NULL
);

CREATE UNIQUE INDEX idx_categories_default_slug ON categories(slug) WHERE user_id IS NULL;

-- Same vocabulary already used by the AI tag prompt in celebrate-phrase.js,
-- so structured categories and free-text AI tags stay conceptually aligned.
INSERT INTO categories (slug, label, icon) VALUES
  ('trabalho',     'Trabalho',     '💼'),
  ('saude',        'Saúde',        '🩺'),
  ('familia',      'Família',      '👨‍👩‍👧'),
  ('estudos',      'Estudos',      '📚'),
  ('exercicio',    'Exercício',    '🏃'),
  ('casa',         'Casa',         '🏠'),
  ('financeiro',   'Financeiro',   '💰'),
  ('social',       'Social',       '🤝'),
  ('autocuidado',  'Autocuidado',  '🧘'),
  ('criatividade', 'Criatividade', '🎨')
ON CONFLICT (slug) WHERE user_id IS NULL DO NOTHING;
