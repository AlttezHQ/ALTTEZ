import { supabase, isSupabaseReady } from "../../../shared/lib/supabase";

export async function uploadImage(file, folder = "logos") {
  if (!file) return null;
  
  // Si no hay Supabase, fallback a Base64
  if (!isSupabaseReady) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('torneos') // bucket
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error subiendo imagen a Supabase:", uploadError);
      // Fallback a Base64 si falla por falta de bucket
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage.from('torneos').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("Error en uploadImage:", err);
    return null;
  }
}
