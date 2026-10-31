import sys
from edit import *
C, V = 'cards2/', 'v2/'
src = {n: Source(V + n) for n in ['xp', 'cards', 'hof', 'cite', 'lb', 'coin', 'spencer', 'silphium', 'rationals', 'werewolf', 'colombia', 'witches']}
RED = (225, 60, 40)
END = lambda: Card(C + 'end.png', 1.8, punch=1.2, flash=0.6)
weird = ['religion-cargo-cults', 'misc-undeciphered', 'misc-numberstations', 'religion-forgeries', 'misc-lostcities', 'misc-vanishings']

hype = [
    Card(C + 'hook1.png', 0.45, punch=1.15, flash=0.0),
    Card(C + 'hook2.png', 0.55, punch=1.10),
    *[Card(C + f'flash-{t}.png', 0.30, punch=1.18, flash=0.35) for t in weird],
    Clip(src['cards'], 1.7, 3.4, dur=1.4, view=((0, 1.0, .5, .55), (1, 1.15, .5, .55)),
         overlays=[Caption('Collect every topic', 0.05, style='pill', y=1500)]),
    Clip(src['xp'], 3.1, 4.6, dur=0.95, overlays=[Caption('Earn XP', 0.05, style='pill', y=1500)]),
    Clip(src['xp'], 4.6, 6.6, dur=1.3, view=((0, 1.0, .5, .5), (.35, 1.7, .8, .1), (1, 1.75, .8, .1)), punch=1.0, flash=0,
         shakes=[(0.6, 0.3, 16)], overlays=[Caption('Level up', 0.6, style='impact', y=1080, rot=-4), Sticker('🔥', 0.7, 830, 1330, 240)]),
    Clip(src['hof'], 1.4, 3.0, dur=1.2, view=((0, 1.0, .5, .6), (1, 1.12, .5, .72)),
         overlays=[Caption('Unlock legends', 0.05, style='pill', y=330)]),
    Clip(src['cite'], 2.6, 4.8, dur=1.5, view=((0, 1.0, .5, .5), (1, 1.08, .5, .62)),
         overlays=[Caption('Every fact sourced', 0.05, style='pill', y=330)]),
    Clip(src['lb'], 1.25, 3.2, dur=1.4, view=((0, 1.05, .5, .32), (1, 1.2, .5, .32)),
         overlays=[Caption('Top the board', 0.05, style='pill', y=1500)]),
    END(),
]

coin = [
    Clip(src['coin'], 0.0, 2.62, dur=2.62, view=((0, 1.0, .5, .5), (1, 1.06, .5, .3)), punch=1.0, flash=0,
         overlays=[Caption('me after 10 heads\nin a row:', 0.1, style='tiktok', y=1180), Caption('tails is due', 1.1, style='impact', y=1520, rot=-4)]),
    Clip(src['coin'], 2.62, 3.7, dur=1.08, view=((0, 1.04, .5, .32), (1, 1.06, .5, .32)), punch=1.14, flash=0.5, flash_colour=RED,
         shakes=[(0.04, 0.38, 20)], overlays=[Sticker('💀', 0.12, 540, 1380, 340, rot=-6)]),
    Clip(src['coin'], 3.7, 6.9, dur=2.8, view=((0, 1.0, .5, .5), (1, 1.06, .5, .45)),
         overlays=[Caption("the gambler's fallacy\ngot me", 0.1, style='tiktok', y=1560)]),
    END(),
]

spencer = [
    Clip(src['spencer'], 0.0, 2.8, dur=2.6, view=((0, 1.0, .5, .5), (1, 1.06, .5, .3)), punch=1.0, flash=0,
         overlays=[Caption('easy one:', 0.1, style='tiktok', y=1260), Caption('me: Darwin.\nobviously.', 0.9, style='tiktok', y=1500)]),
    Clip(src['spencer'], 2.8, 3.7, dur=0.95, view=((0, 1.04, .5, .35), (1, 1.06, .5, .35)), punch=1.14, flash=0.5, flash_colour=RED,
         shakes=[(0.04, 0.38, 20)], overlays=[Caption('wait. what', 0.1, style='impact', y=1500, rot=-4), Sticker('😳', 0.2, 860, 1210, 270)]),
    Clip(src['spencer'], 3.7, 6.9, dur=2.6, view=((0, 1.0, .5, .5), (1, 1.06, .5, .5)),
         overlays=[Caption('it was Herbert Spencer', 0.1, style='pill', y=1640)]),
    END(),
]


# The quiz-fail format: setup captions, the confident wrong tap lands with a red flash and shake, then the app's explanation.
def meme(name, setup, boast, react, payoff, payoff_style='pill', payoff_y=1500, react_text=None, setup_y=1220, boast_y=1540):
    s = src[name]
    hit = [Sticker(react, 0.15, 540 if not react_text else 860, 1360 if not react_text else 1210, 330 if not react_text else 270, rot=-6)]
    if react_text: hit.insert(0, Caption(react_text, 0.1, style='impact', y=1500, rot=-4))
    return [
        Clip(s, 0.0, 2.8, dur=2.6, view=((0, 1.0, .5, .5), (1, 1.06, .5, .3)), punch=1.0, flash=0,
             overlays=[Caption(setup, 0.1, style='tiktok', y=setup_y), Caption(boast, 1.0, style='impact', y=boast_y, rot=-4)]),
        Clip(s, 2.8, 3.7, dur=0.95, view=((0, 1.04, .5, .35), (1, 1.06, .5, .35)), punch=1.14, flash=0.5, flash_colour=RED,
             shakes=[(0.04, 0.38, 20)], overlays=hit),
        Clip(s, 3.7, 6.9, dur=2.6, view=((0, 1.0, .5, .5), (1, 1.06, .5, .5)),
             overlays=[Caption(payoff, 0.1, style=payoff_style, y=payoff_y)]),
        END(),
    ]

silphium = meme('silphium', 'me, who saw ONE TikTok\nabout this:', '100% true', '💀', 'the internet lied to me', payoff_style='tiktok')
rationals = meme('rationals', 'there are more fractions\nthan whole numbers.\nright?', 'right??', '🤯', 'same size infinity', setup_y=1180)
werewolf = meme('werewolf', 'werewolf trials?\nthat was never a thing', 'false', '🐺', 'about 280 known cases', react_text='wait. what')
colombia = meme('colombia', 'Colombia and Bolivia,\nboth named after Columbus?', 'sounds right', '😭', 'Bolivia: Simón Bolívar')
witches = meme('witches', 'how many were executed\nin the witch hunts?', 'like 10 million', '😬', 'about 40,000 to 60,000', payoff_y=330, setup_y=1290, boast_y=1590)

cuts = {'hype': hype, 'coin': coin, 'spencer': spencer, 'silphium': silphium, 'rationals': rationals, 'werewolf': werewolf, 'colombia': colombia, 'witches': witches}
for name in sys.argv[1:] or cuts:
    render(cuts[name], f'out2/nous-{name}.mp4')
