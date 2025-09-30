
import Loadingcharge from "@/components/LoadingCharge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Truck, Shield } from "lucide-react";
import AuthHeader from "@/components/AuthHeader";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <AuthHeader />
      
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">New World Ent</h1>
            <p className="text-blue-600 mb-8">Please sign in to access the system</p>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {/* Navigation Links */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Link to="/transit">
            <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              View Transit
            </Button>
          </Link>
          <Link to="/admin">
            <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
        
        <Loadingcharge />
      </SignedIn>
    </div>
  );
};

export default Index;
