// hooks/useUserRoles.ts
import { useState, useEffect } from 'react';

// Define the shape of the roles object to match your Angular logic
export interface UserRoles {
  owner: boolean;
  fleet: boolean;
  fleet_admin: boolean;
  unit_admin: boolean;
  ratecard: boolean;
  finance: boolean;
  shipment: boolean;
  sales_person: boolean;
}

// This custom hook is the React equivalent of your getRoles() function
export const useUserRoles = (): UserRoles => {
  const [roles, setRoles] = useState<UserRoles>({
    owner: false,
    fleet: false,
    fleet_admin: false,
    unit_admin: false,
    ratecard: false,
    finance: false,
    shipment: false,
    sales_person: false,
  });

  useEffect(() => {
    // This logic runs once when a component using the hook is first rendered
    try {
      // 1. Get the roles string from local storage
      const storedRolesRaw = localStorage.getItem('roles');

      if (storedRolesRaw) {
        // 2. Parse it into an array
        const storedRoles: { value: string }[] = JSON.parse(storedRolesRaw);
        
        // 3. Loop through the array and set boolean flags (identical logic to Angular)
        const newRoles: UserRoles = {
          owner: storedRoles.some(role => role.value === 'account_owner'),
          fleet: storedRoles.some(role => 
            role.value === 'fleet_shipment_executive' || 
            role.value === 'fleet_shipment_administrator'
          ),
          fleet_admin: storedRoles.some(role => role.value === 'fleet_shipment_administrator'),
          unit_admin: storedRoles.some(role => role.value === 'unit_administrator'),
          ratecard: storedRoles.some(role => 
            role.value === 'ratecard_administrator' || 
            role.value === 'ratecard_executive'
          ),
          finance: storedRoles.some(role => 
            role.value === 'finance_executive' || 
            role.value === 'finance_administrator'
          ),
          shipment: storedRoles.some(role => role.value === 'shipment_administrator'),
          sales_person: storedRoles.some(role => role.value === 'sales_person'),
        };
        setRoles(newRoles);
      }
    } catch (error) {
      console.error("Failed to parse user roles from local storage", error);
    }
  }, []); // The empty array [] ensures this logic runs only once

  // 4. Return the object with the user's roles
  return roles;
};