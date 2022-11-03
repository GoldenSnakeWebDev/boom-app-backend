import mongoose from "mongoose";

export class SeedHelper {
  // constructor
  private _dbUrl: string;

  constructor(dbUrl: string) {
    this._dbUrl = dbUrl;
  }

  async connectToDb() {
    await mongoose.connect(this._dbUrl);
  }
}
