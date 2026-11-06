# The Doge Machine cut, in the lab-cut style. Record first:
#   node record.mjs RECDIR cut-doge-machine   (script in rec/cuts-politics.mjs)
# Usage: python3 politics_cuts.py RECDIR [name...]   -> ~/Videos/Nous/nous-politics-<name>.mp4
import os, sys
from labclip import Beat, Source, render

REC = sys.argv[1]
OUT = os.path.expanduser('~/Videos/Nous')
S = lambda n: Source(os.path.join(REC, 'cut-' + n))
GOLD = '#8C6D1F'
END = dict(kicker='Strange Politics', accent=GOLD, title='Strange Politics', line='Lottery rulers, pottery ballots, elections drawn from a bowl.')


def doge():
    s = S('doge-machine')
    return dict(END, title='Doge Machine', line="Run Venice's ten-round election and see who it favors.", beats=[
        Beat(s, 0.5, 3.3, 'Venice elected its doge in <em>ten rounds</em>', 'Your faction holds 60% of the Great Council', dur=3.0,
             cam=((0, 390, 520, 780), (1, 390, 560, 780))),
        Beat(s, 3.3, 5.6, 'Lots, then votes, then <em>lots again</em>', 'Every name needs a supermajority', dur=2.5,
             cam=((0, 390, 560, 780), (1, 390, 640, 760))),
        Beat(s, 5.6, 8.6, 'One unlucky draw: <em>0 of 9</em>', 'The rivals name every elector after that', dur=3.0,
             cam=((0, 390, 760, 720), (1, 390, 860, 680))),
        Beat(s, 10.1, 11.0, 'A 60% majority, <em>no doge</em>', "A rival's doge", dur=1.8,
             cam=((0, 390, 900, 780), (1, 390, 880, 760))),
        Beat(s, 12.1, 15.2, 'Even 60% wins only <em>6 times in 10</em>', 'A straight vote would win every time', dur=3.2,
             cam=((0, 390, 560, 780), (1, 390, 580, 740))),
    ])


# The three lesson stories (Virginia tie, 27th Amendment, ostraka) are animations instead: see stories.py.
CUTS = {'doge-machine': doge}

for name in sys.argv[2:] or CUTS:
    c = CUTS[name]()
    render(c['beats'], os.path.join(OUT, f'nous-politics-{name}.mp4'), c['kicker'], c['accent'], c['title'], c['line'],
           os.path.join(REC, '_work', name))
