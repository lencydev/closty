import { model as Model, Schema } from 'mongoose';

export default Model('language',
  new Schema<LanguageSchema>({
    guild: { type: String, required: true },
    language: { type: String, required: true, default: 'en-US' },
  }),
);