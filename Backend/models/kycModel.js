import mongoose from "mongoose";

const kycVerificationSchema = new mongoose.Schema(
  {
    contact: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true },
    idProofType: { type: String, required: true },
    idProofImage: { type: String},
    
  },
  {
    timestamps: true,
  }
);

const KycVerification = mongoose.model("KycVerification", kycVerificationSchema);

export default KycVerification;
