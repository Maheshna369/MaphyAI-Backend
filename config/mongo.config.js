import mongoose from "mongoose";
import env from "dotenv";
env.config();
const mongoUri = process.env.MONGO_URI;
const connectDB = () => {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("MONGO DB is connected to the Server !"))
    .catch((err) =>
      console.log(
        `Error while connecting the MONGO DB to the Server is: ${err}`,
      ),
    );
};
export default connectDB;
