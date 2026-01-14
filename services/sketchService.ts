import { Sketch } from '../types';
import { supabase } from './supabaseClient';

const TABLE_NAME = 'sketches';

export const sketchService = {
  // Fetch all sketches from Supabase
  getAll: async (): Promise<Sketch[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false }); // Latest first
      
      if (error) throw error;
      
      return (data || []).map(mapFromDb);
    } catch (e: any) {
      console.error("Failed to load data from Supabase:", e.message || e);
      return [];
    }
  },

  // Create or Update a sketch
  save: async (sketch: Sketch): Promise<Sketch[]> => {
    try {
      const dbPayload = mapToDb(sketch);
      
      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(dbPayload);

      if (error) throw error;

      return sketchService.getAll();
    } catch (e: any) {
      console.error("Failed to save sketch:", e.message || e);
      throw e;
    }
  },

  // Delete a sketch
  delete: async (id: string): Promise<Sketch[]> => {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;

      return sketchService.getAll();
    } catch (e: any) {
      console.error("Failed to delete sketch:", e.message || e);
      throw e;
    }
  },

  // Real-time updates
  listenForUpdates: (callback: (data: Sketch[]) => void) => {
    const channel = supabase
      .channel('public:sketches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE_NAME },
        async () => {
          const newData = await sketchService.getAll();
          callback(newData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

// --- Helpers to map between DB (snake_case) and App (camelCase) ---

function mapToDb(sketch: Sketch) {
  return {
    id: sketch.id,
    order_number: sketch.orderNumber,
    import_date: sketch.importDate,
    export_date: sketch.exportDate,
    gender: sketch.gender,
    status: sketch.status,
    designer_name: sketch.designerName,
    payment_status: sketch.paymentStatus,
    payment_amount: sketch.paymentAmount,
    production_unit: sketch.productionUnit,
    processing_items: sketch.processingItems, // Mapped
    completed_items: sketch.completedItems,   // Mapped
    created_at: sketch.createdAt ? new Date(sketch.createdAt).toISOString() : new Date().toISOString()
  };
}

function mapFromDb(dbRecord: any): Sketch {
  return {
    id: dbRecord.id,
    orderNumber: dbRecord.order_number,
    importDate: dbRecord.import_date,
    exportDate: dbRecord.export_date,
    gender: dbRecord.gender,
    status: dbRecord.status,
    designerName: dbRecord.designer_name,
    paymentStatus: dbRecord.payment_status,
    paymentAmount: dbRecord.payment_amount,
    productionUnit: dbRecord.production_unit,
    processingItems: dbRecord.processing_items, // Mapped
    completedItems: dbRecord.completed_items,   // Mapped
    createdAt: dbRecord.created_at ? new Date(dbRecord.created_at).getTime() : Date.now()
  };
}