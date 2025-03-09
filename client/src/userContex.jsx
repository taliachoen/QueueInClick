import { createContext } from 'react';
import useLocalStorage from './useLocalStorage';

export const UserContext = createContext({});

export const UserProvider = ({children}) => {
    const [user, setUser] = useLocalStorage('user', null);
    const data = { 
        user,
        setUser(user) {
          setUser(user);
        }
       }
    return <UserContext.Provider value={data}>
        {children}
    </UserContext.Provider>
}
export default UserProvider;