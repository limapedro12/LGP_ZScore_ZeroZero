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
        { id: 'teamA', logoURL: '/images/teamA.png', color: '#FF0000', acronym: 'TA', name: 'Team A', sport: 'Football' },
        { id: 'teamB', logoURL: '/images/teamB.png', color: '#00FF00', acronym: 'TB', name: 'Team B', sport: 'Football' },
        { id: 'teamC', logoURL: '/images/teamC.png', color: '#0000FF', acronym: 'TC', name: 'Team C', sport: 'Basketball' },
        { id: 'teamD', logoURL: '/images/teamD.png', color: '#FFFF00', acronym: 'TD', name: 'Team D', sport: 'Basketball' },
    ];
    return Promise.resolve(teams.find((team) => team.id === teamId) || null);
}
