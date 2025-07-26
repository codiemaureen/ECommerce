import { Metadata } from "next";
import { auth } from "@/auth";
// import { SessionProvider } from 'next-auth/react';
import ProfileForm from "./profile-form";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: 'Customer Profile'
}

const Profile = async () => {
  const session = await auth();
  if (!session) redirect('/login');
  
  return ( 
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="h2-bold">Profile</h2>
        <ProfileForm />
      </div>
    );
}

export default Profile;