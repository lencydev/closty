import mongoose from 'mongoose';

(async function (): Promise<void> {

  await mongoose.connect(Data.MongoDB);
})();