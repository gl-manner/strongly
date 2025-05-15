// /imports/hooks/useUser.js
import { useContext } from 'react';
import { UserContext } from '/imports/ui/contexts/UserContext';

export const useUser = () => {
  return useContext(UserContext);
};
