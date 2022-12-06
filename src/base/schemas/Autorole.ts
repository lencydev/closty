import { model as Model, Schema } from 'mongoose';

export default Model('autorole',
  new Schema<AutoroleSchema>({
    guild: { type: String, required: true },
    roles: { type: [ String ], required: true, default: [] },
  }),
);