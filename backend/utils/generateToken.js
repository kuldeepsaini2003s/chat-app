import jwt from "jsonwebtoken";

const generateToken = (user, exp) => {
  return jwt.sign(
    { email: user?.email, id: user?._id },
    process.env.JWT_SECRET,
    {
      expiresIn: exp,
    }
  );
};

export { generateToken };
