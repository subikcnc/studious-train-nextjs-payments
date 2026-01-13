import React from "react";

const KhaltiSuccess = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  const sp = await searchParams;
  const { pidx } = sp || {};
  console.log("This is the pidx in the khalti success page", pidx);
  let responseData;
  try {
    const response = await fetch(
      `${process.env.KHALTI_API_VERIFICATION_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
        body: JSON.stringify({ pidx }),
      }
    );
    responseData = await response.json();
    console.log("This is the data from the khalti verify api", responseData);
  } catch (error) {
    throw new Error(error as string);
  }
  return (
    <div className="w-full flex h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        {Object.entries(responseData).map(([key, value]) => (
          <p key={key}>{`${key}: ${value}`}</p>
        ))}
      </div>
    </div>
  );
};

export default KhaltiSuccess;

/*
User is redirected to this success page after making the payment
and then we need to verify the payment
*/
