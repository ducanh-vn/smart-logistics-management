export interface WarehouseRef {
  id: number;
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export interface MetaData {
  warehouses: WarehouseRef[];
}
