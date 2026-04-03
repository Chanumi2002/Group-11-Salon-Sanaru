import { useState } from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Sparkles, Loader2, User, Droplets, Wind, AlertCircle } from "lucide-react";

export default function AiRecommendation() {
  const [formData, setFormData] = useState({
    skinType: "",
    hairType: "",
    faceShape: "",
    age: "",
    concerns: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
  const hairTypes = ["Straight", "Wavy", "Curly", "Coily"];
  const faceShapes = ["Oval", "Round", "Square", "Heart", "Diamond"];
  const ageGroups = ["Under 18", "18-25", "26-35", "36-45", "46-55", "Over 55"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/ai/recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        if (response.status === 400) {
          throw new Error("Please fill out all required fields properly.");
        }
        throw new Error("Unable to generate recommendation. Please try again.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4 shadow-inner">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            AI Beauty Advisor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock your personalized beauty routine. Tell us a bit about yourself, and our AI will curate the perfect products and services just for you.
          </p>
        </div>

        {!result ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-purple-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Droplets className="w-5 h-5 text-blue-500" /> Skin Type
                  </label>
                  <select
                    name="skinType"
                    required
                    value={formData.skinType}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                  >
                    <option value="">Select your skin type</option>
                    {skinTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Wind className="w-5 h-5 text-teal-500" /> Hair Type
                  </label>
                  <select
                    name="hairType"
                    required
                    value={formData.hairType}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                  >
                    <option value="">Select your hair type</option>
                    {hairTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <User className="w-5 h-5 text-pink-500" /> Face Shape
                  </label>
                  <select
                    name="faceShape"
                    required
                    value={formData.faceShape}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                  >
                    <option value="">Select your face shape</option>
                    {faceShapes.map((shape) => (
                      <option key={shape} value={shape}>{shape}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <User className="w-5 h-5 text-indigo-500" /> Age Group
                  </label>
                  <select
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                  >
                    <option value="">Select your age group</option>
                    {ageGroups.map((age) => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <AlertCircle className="w-5 h-5 text-orange-500" /> Primary Concerns (Optional)
                </label>
                <textarea
                  name="concerns"
                  placeholder="e.g. Acne, dry scalp, anti-aging, split ends..."
                  value={formData.concerns}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none resize-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing your profile...
                  </>
                ) : (
                  <>Get My Recommendations</>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
            <div className="p-6 md:p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Your Beauty Prescription
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mt-2 max-w-3xl">
                    {result.explanation}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setResult(null)} className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50">
                  Start Over
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50/50 rounded-2xl p-6 md:p-8 border border-purple-100 transition-all hover:shadow-md">
                  <h3 className="text-xl font-bold text-purple-900 mb-5 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" /> Recommended Services
                  </h3>
                  <ul className="space-y-4">
                    {result.recommendedServices?.map((service, idx) => (
                      <li key={idx} className="flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm border border-purple-50">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                          {idx + 1}
                        </span>
                        <span className="text-purple-900 font-medium pt-1">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-pink-50/50 rounded-2xl p-6 md:p-8 border border-pink-100 transition-all hover:shadow-md">
                  <h3 className="text-xl font-bold text-pink-900 mb-5 flex items-center gap-2">
                    <Droplets className="w-6 h-6 text-pink-600" /> Curated Products
                  </h3>
                  <ul className="space-y-4">
                    {result.recommendedProducts?.map((product, idx) => (
                      <li key={idx} className="flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm border border-pink-50">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                          {idx + 1}
                        </span>
                        <span className="text-pink-900 font-medium pt-1">{product}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 md:p-8 border border-orange-100">
                <h3 className="text-xl font-bold text-orange-900 mb-5 flex items-center gap-2">
                  <Wind className="w-6 h-6 text-orange-600" /> Daily Beauty Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.beautyTips?.map((tip, idx) => (
                    <div key={idx} className="bg-white/80 p-5 rounded-xl shadow-sm text-sm md:text-base text-orange-900 font-medium border border-orange-100 flex items-start gap-3">
                       <span className="text-orange-400 mt-0.5">•</span>
                       {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
