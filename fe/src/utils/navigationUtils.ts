import { NavigateFunction } from 'react-router-dom';
import { Sport } from '../api/apiManager';


export const correctSportParameter = (
    sportParam: string | undefined,
    actualSport: Sport,
    navigate: NavigateFunction
): boolean => {
    if (!sportParam || sportParam === actualSport) {
        return false;
    }

    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${sportParam}/`, `/${actualSport}/`);

    navigate(newPath, { replace: true });
    return true;
};
