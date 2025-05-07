import React from 'react';


interface TeamInfoProps {
    team: 'home' | 'away';
}

const TeamInfo: React.FC<TeamInfoProps> = ({ team }) =>
    // Placeholder: Replace with actual team/player info rendering
    (
        <div>

            <h5>
                {team === 'home' ? 'Home Team' : 'Away Team'}
            </h5>
            {/* You can render players or other info here */}
        </div>
    )
;

export default TeamInfo;
