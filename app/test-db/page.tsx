import { supabase } from "@/lib/supabase";

export default async function TestDbPage() {
  const { error } = await supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 text-2xl font-bold">Kết nối Supabase thất bại</p>
          <p className="text-red-300 mt-2 text-sm">{error.message}</p>
        </div>
      ) : (
        <p className="text-green-400 text-2xl font-bold">Kết nối Supabase thành công</p>
      )}
    </div>
  );
}
