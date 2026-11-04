from labclip import Beat

def cuts(S):
    def power_map():
        s = S('power-map')
        return dict(kicker='Politics', accent='#9C3D45', title='Power Map', line='Move candidates, change the rules, and watch who wins.', beats=[
            Beat(s, 0.4, 5.4, 'Count the vote, <em>ballot by ballot</em>', 'First past the post: Blue edges it', dur=3.8,
                 cam=((0, 390, 640, 780), (1, 390, 650, 780))),
            Beat(s, 5.5, 8.4, 'Same voters, <em>a new winner</em>', 'Ranked choice: Green\'s voters go to Red', dur=2.9,
                 cam=((0, 390, 650, 780), (1, 390, 660, 760))),
            Beat(s, 8.6, 12.2, 'Share the seats, <em>share the power</em>', 'Blue 4, Red 4, Green 2: nobody has a majority', dur=3.4,
                 cam=((0, 390, 670, 770), (1, 390, 690, 760))),
        ])

    # The camera frames the seat score and the map; the mode chips stay above the crop.
    def gerrymander():
        s = S('gerrymander')
        cam = lambda w0, w1: ((0, 390, 648, w0), (1, 390, 648, w1))
        return dict(kicker='Politics', accent='#9C3D45', title='Gerrymander', line='Same voters. Redraw the lines, flip the seats.', beats=[
            Beat(s, 0.35, 5.6, 'A 50/50 state, <em>neutral lines</em>', '25 Blue voters, 24 Red. Blue wins 4 seats to 3', dur=4.4,
                 cam=cam(630, 672)),
            Beat(s, 5.75, 11.1, 'Blue draws the map: <em style="color:#4A5FE0">6 seats to 1</em>', 'Red packed into one corner, cracked everywhere else', dur=4.4,
                 cam=cam(672, 672)),
            Beat(s, 11.15, 16.6, 'Red draws the map: <em style="color:#E74C3C">6 seats to 1</em>', 'The same voters. Blue\'s city packed into one district', dur=4.6,
                 cam=cam(672, 672)),
            Beat(s, 16.6, 17.7, 'Same voters. <em>Opposite result.</em>', 'Whoever draws the lines picks the winner', dur=2.2,
                 cam=cam(672, 640)),
        ])

    def front_page():
        s = S('front-page')
        return dict(kicker='Media', accent='#3E4650', title='Front Page Builder', line='One event, three choices, very different front pages.', beats=[
            Beat(s, 0.3, 4.2, 'Same facts, <em>a calm front page</em>', 'Plain words, and the needle sits at balanced', dur=3.6,
                 cam=((0, 390, 760, 780), (1, 390, 750, 780))),
            Beat(s, 5.0, 7.2, 'Now pick <em>the loud words</em>', 'Riot, mob, smashed storefronts', dur=2.0,
                 cam=((0, 390, 540, 780), (1, 390, 520, 780))),
            Beat(s, 7.3, 11.25, 'Same event, <em>a slanted page</em>', 'Strongly critical, and two facts misstated', dur=3.7,
                 cam=((0, 390, 560, 780), (.3, 390, 560, 780), (.5, 390, 750, 770), (1, 390, 750, 770))),
        ])

    # Plot beats play at real speed so the melody stays in tune.
    def plot_geometry():
        s = S('plot')
        return dict(kicker='Literature', accent='#5E6B2F', title='Plot Geometry', line='Trace the shape of famous stories, beat by beat.', beats=[
            Beat(s, 0.3, 4.0, 'Every story <em>has a shape</em>', 'Beowulf peaks twice, decades apart',
                 cam=((0, 390, 640, 780), (1, 390, 660, 770))),
            Beat(s, 4.1, 7.9, 'Hear the arc <em>as a melody</em>', 'Each beat is a note; the climax is the highest',
                 cam=((0, 390, 640, 780), (.3, 390, 860, 760), (1, 390, 860, 760))),
            Beat(s, 8.0, 11.8, 'The Odyssey: <em>one long climb</em>', 'Up to the suitors\' slaughter, then home',
                 cam=((0, 390, 760, 780), (1, 390, 840, 760))),
        ])

    return {'power-map': power_map, 'gerrymander': gerrymander, 'front-page': front_page, 'plot-geometry': plot_geometry}
