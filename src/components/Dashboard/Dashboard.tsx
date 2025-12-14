import { useEffect, useState } from 'react'
import { $authLoading, $user, logout } from '../../lib/stores/auth'
import { useStore } from '@nanostores/react';
import AuthLoader from '../AuthLoader/AuthLoader';

function Dashboard() {

    const user = useStore($user);
    const authLoading = useStore($authLoading);

    const [isFromLoginRedirect] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const isRedirect = sessionStorage.getItem("from_login_redirect");
            if (isRedirect) {
                sessionStorage.removeItem("from_login_redirect");
                return true; 
            }
        }
        return false;
    });

    const [minDelayPassed, setMinDelayPassed] = useState<boolean>(false);

    useEffect(() => {
        if (!minDelayPassed) {
            const timer = setTimeout(() => {
                setMinDelayPassed(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [minDelayPassed]);

    const handleClick = async () => {
        await logout();
    }

    const showLoader = (authLoading || !minDelayPassed) && !isFromLoginRedirect;

    if (showLoader) {
        return <AuthLoader />;
    }

    if (!user && !authLoading) {
        window.location.href = "/login"
        return null;
    }
  return (
    <>

        Welomce to my dashboard
        <button className='text-white block' onClick={handleClick}>Log me Out</button>
    </>
  )
}

export default Dashboard