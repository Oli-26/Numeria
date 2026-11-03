from labclip import Beat

def cuts(S):
    def deep_time():
        s = S('deep-time')
        return dict(kicker='Geology', accent='#7A5A44', title='Deep Time Scroller', line="Scroll through 4.54 billion years of Earth's history.", beats=[
            Beat(s, 0.5, 4.6, 'Drill down through <em>4.5 billion years</em>', 'The gauge clunks at every new eon', dur=3.2,
                 cam=((0, 390, 480, 780),)),
            Beat(s, 4.6, 8.6, 'Then life <em>gets complicated</em>', 'The Cambrian, the Great Dying, the dinosaurs', dur=3.0,
                 cam=((0, 390, 480, 780),)),
            Beat(s, 8.6, 12.4, 'All of us: <em>a hairline</em>', 'Zoomed to the last 66 million years', dur=3.6,
                 cam=((0, 390, 480, 780),)),
        ])

    def rock_id():
        s = S('rock-id')
        return dict(kicker='Geology', accent='#7A5A44', title='Rock ID', line='Identify rocks with real field tests, from granite to chalk.', beats=[
            Beat(s, 0.5, 4.0, 'A drop of acid: <em>limestone fizzes</em>', 'Calcite gives off carbon dioxide', dur=3.0,
                 cam=((0, 390, 520, 610), (1, 390, 510, 600))),
            Beat(s, 4.0, 5.9, 'Steel <em>cuts a groove</em>', 'Calcite is only 3 on the Mohs scale', dur=2.2,
                 cam=((0, 390, 510, 600), (1, 390, 540, 640))),
            Beat(s, 6.95, 11.6, 'Granite? <em>Too hard to scratch</em>', 'Steel skates off, and the acid just beads up', dur=3.6,
                 cam=((0, 390, 560, 660), (1, 390, 595, 724))),
        ])

    def trade_routes():
        s = S('trade-routes')
        return dict(kicker='History', accent='#9A5B2E', title='Trade Route Tracer', line='Follow the goods, ideas and faiths that crossed the old world.', beats=[
            Beat(s, 0.9, 7.6, 'Follow the <em>Silk Road</em>', "From Xi'an to Venice, oasis by oasis", dur=4.4,
                 cam=((0, 390, 760, 740), (1, 390, 750, 720))),
            Beat(s, 8.2, 15.4, 'Then <em>sail for spices</em>', 'Cloves from Maluku, pepper from Calicut', dur=4.6,
                 cam=((0, 390, 750, 720), (1, 390, 750, 720))),
        ])

    return {'deep-time': deep_time, 'rock-id': rock_id, 'trade-routes': trade_routes}
