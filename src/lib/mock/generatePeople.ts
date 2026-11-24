import { COMPANY_NAMES, COMPANY_PREFIX, GIVEN_NAMES, MIDDLE_NAMES, STREETS, SURNAMES } from "@/constants/mockData";
import { DISTRICTS } from "@/constants/districts";
import type { Random } from "./random";

export const fullName = (r: Random) => `${r.pick(SURNAMES)} ${r.pick(MIDDLE_NAMES)} ${r.pick(GIVEN_NAMES)}`;
export const phoneNumber = (r: Random) => `09${r.int(10, 99)}${String(r.int(0, 999999)).padStart(6, "0")}`;
export const streetAddress = (r: Random, district: string) => `Số ${r.int(1, 299)} ${r.pick(STREETS)}, ${district}`;

export interface MockCustomer {
  code: string;
  name: string;
  phone: string;
  address: string;
}

export function generateCustomers(r: Random, count: number): MockCustomer[] {
  return Array.from({ length: count }, (_, i) => {
    const district = r.pick(DISTRICTS.filter((d) => d.zone === "URBAN"));
    return {
      code: `KH${String(i + 1).padStart(4, "0")}`,
      name: `${r.pick(COMPANY_PREFIX)} ${r.pick(COMPANY_NAMES)} ${i + 1}`,
      phone: phoneNumber(r),
      address: streetAddress(r, district.name),
    };
  });
}

export interface MockDriver {
  code: string;
  fullName: string;
  phone: string;
  licenseNo: string;
  shift: "MORNING" | "AFTERNOON";
}

export function generateDrivers(r: Random, count: number): MockDriver[] {
  return Array.from({ length: count }, (_, i) => ({
    code: `TX${String(i + 1).padStart(2, "0")}`,
    fullName: fullName(r),
    phone: phoneNumber(r),
    licenseNo: `C-${r.int(100000, 999999)}`,
    shift: i % 3 === 2 ? "AFTERNOON" : "MORNING",
  }));
}
