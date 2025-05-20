import { ApiTeam } from '../api/apiManager';

export function getAvailPlacardsMock() {
    return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([
            {
                id: '1',
                firstTeamId: 'teamA',
                secondTeamId: 'teamB',
                isFinished: false,
                sport: 'futsal',
                startTime: '2023-10-01T15:00:00Z',
            },
            {
                id: '2',
                firstTeamId: 'teamC',
                secondTeamId: 'teamD',
                isFinished: false,
                sport: 'basket',
                startTime: '2023-10-02T18:00:00Z',
            },
        ]),
    });
}

export function getPlacardInfoMock(placardId: string) {
    const placards = [
        {
            id: '1',
            firstTeamId: 'teamA',
            secondTeamId: 'teamB',
            isFinished: false,
            sport: 'futsal',
            startTime: '2023-10-01T15:00:00Z',
        },
        {
            id: '2',
            firstTeamId: 'teamC',
            secondTeamId: 'teamD',
            isFinished: false,
            sport: 'basket',
            startTime: '2023-10-02T18:00:00Z',
        },
    ];
    return Promise.resolve(placards.find((placard) => placard.id === placardId) || null);
}

export function getTeamInfoMock(teamId: string): Promise<ApiTeam | null> {
    const teams: ApiTeam[] = [
        {
            id: 'teamA',
            logoURL: 'https://www.zerozero.pt/img/logos/equipas/89/77789_logo_retorta.jpg',
            color: '#FF0000',
            acronym: 'TA',
            name: 'Retorta Futsal',
            sport: 'futsal',
        },
        {
            id: 'teamB',
            logoURL: 'https://www.zerozero.pt/img/logos/equipas/37/236537_logo_supreme_chonburi.png',
            color: '#00FF00',
            acronym: 'TB',
            name: 'Supreme Chonburi',
            sport: 'volleyball',
        },
        {
            id: 'teamC',
            logoURL: 'https://www.zerozero.pt/img/logos/equipas/212592_imgbank.png',
            color: '#0000FF',
            acronym: 'TC',
            name: 'Guangdong Southern Tigers',
            sport: 'basket',
        },
        {
            id: 'teamD',
            logoURL: 'https://www.zerozero.pt/img/logos/equipas/6027_imgbank_1697705961.png',
            color: '#FFFF00',
            acronym: 'TD',
            name: 'Beijing Guoan',
            sport: 'basket',
        },
    ];
    return Promise.resolve(teams.find((team) => team.id === teamId) || null);
}
