import { SeedHelper } from "./seed-helper";
import { config } from "../config";
import { User } from "../models";
import { UserType } from "./../types/user";

export class SuperAdminSeed extends SeedHelper {
  constructor() {
    super(config.DB_URL);
    // must call this
    Object.setPrototypeOf(this, SuperAdminSeed.prototype);
  }

  /**
   * Actual seeding
   */
  async seed() {
    try {
      const exist = await User.findOne({
        is_admin: true,
        user_type: UserType.SUPERADMIN,
      });

      if (!exist) {
        User.create({
          first_name: "Boom Admin",
          last_name: "Admin",
          device_id: "admin@somedeviceNumber",
          photo: "",
          cover: "Cover Page",
          email: "admin@admin.com",
          location: "",
          is_admin: true,
          bio: "Main Bio Informantion",
          username: "dAdmin",
          password: "admin@123",
          user_type: UserType.SUPERADMIN,
          is_active: true,
        });
      }

      console.log("Created Admin");
    } catch (error) {
      console.log("Error", error);
    }
  }
}

export const superAdminSeed = new SuperAdminSeed();
