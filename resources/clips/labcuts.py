# The editorial lab cuts. Record first: node record.mjs RECDIR cut-<name> ... (scripts in rec/cuts.mjs).
# Usage: python3 labcuts.py RECDIR [name...]   -> ~/Videos/Nous/nous-lab-<name>.mp4
# cam keyframes are (u, centre x, centre y, width) in recording pixels (780x1560); see labclip.Beat.
import os, sys
from labclip import Beat, Source, render

REC = sys.argv[1]
OUT = os.path.expanduser('~/Videos/Nous')
S = lambda n: Source(os.path.join(REC, 'cut-' + n))

def evolution():
    s = S('evolution')
    return dict(kicker='Biology', accent='#3F7D4E', title='Evolution Simulator', line='Watch selection, drift and mutation change a population.', beats=[
        Beat(s, 0.3, 4.6, 'Soot turns the bark <em>black</em>', 'Birds eat the moths they can see', dur=3.2,
             cam=((0, 390, 640, 780), (1, 390, 620, 700))),
        Beat(s, 4.6, 9.7, 'Clean the air and <em>pale moths return</em>', 'The pale form comes back, generation by generation', dur=3.8,
             cam=((0, 390, 620, 700), (1, 390, 640, 760))),
    ])

def era_map():
    s = S('era-map')
    return dict(kicker='History', accent='#9A5B2E', title='Era Map', line='Slide through time and watch empires rise and fall.', beats=[
        Beat(s, 0.6, 6.6, 'Watch empires <em>rise and fall</em>', 'Rome, Han China, the Abbasids, the Tang', dur=3.8,
             cam=((0, 390, 600, 780), (1, 390, 590, 740))),
        Beat(s, 6.6, 14.4, 'Every era <em>redraws the map</em>', 'Mongols, Ottomans, then the world wars', dur=4.4,
             cam=((0, 390, 590, 740), (1, 390, 560, 680))),
    ])

def market():
    s = S('market')
    return dict(kicker='Economics', accent='#2F6F8F', title='Market Sim', line='Supply and demand, taxes, ceilings and deadweight loss.', beats=[
        Beat(s, 0.5, 6.6, 'Move demand, <em>the price follows</em>', 'Buyers and sellers settle where the curves cross', dur=3.0,
             cam=((0, 390, 560, 780), (1, 390, 600, 740))),
        Beat(s, 7.3, 10.4, 'Add a tax and <em>trades vanish</em>', 'Those lost deals are the deadweight loss', dur=3.3,
             cam=((0, 390, 640, 740), (1, 390, 620, 640))),
        Beat(s, 10.4, 14.4, 'Bigger tax, <em>bigger loss</em>', 'Buyers pay more, sellers keep less', dur=2.8,
             cam=((0, 390, 620, 640), (1, 390, 640, 720))),
    ])

def trolley():
    s = S('trolley')
    return dict(kicker='Philosophy', accent='#7A3E5E', title='Trolley Lab', line='Branching ethical dilemmas that build your moral profile.', beats=[
        Beat(s, 0.4, 3.0, 'Pull the <em>lever?</em>', 'Five on one track, one on the other', dur=2.6,
             cam=((0, 390, 640, 780), (1, 390, 680, 640))),
        Beat(s, 3.4, 6.6, 'See which ethics <em>agree with you</em>', 'Four frameworks, four verdicts', dur=3.0,
             cam=((0, 390, 880, 760), (1, 390, 900, 740))),
        Beat(s, 7.2, 10.6, 'Now push <em>the stranger?</em>', 'Same numbers. Most people refuse.', dur=3.4,
             cam=((0, 390, 620, 700), (1, 390, 760, 760))),
    ])

def reaction():
    s = S('reaction')
    return dict(kicker='Chemistry', accent='#B4552F', title='Reaction Bench', line='Combine reagents and watch what happens.', beats=[
        Beat(s, 1.5, 3.9, 'Drop potassium <em>in water</em>', 'It skates, fizzes and burns lilac', dur=2.8,
             cam=((0, 385, 600, 620), (.3, 385, 580, 400), (1, 385, 575, 370))),
        Beat(s, 7.8, 11.0, 'Two clear liquids, <em>one yellow solid</em>', 'Silver iodide drops out of solution', dur=2.8,
             cam=((0, 385, 620, 560), (1, 385, 630, 440))),
        Beat(s, 12.6, 16.0, 'Magnesium in acid: <em>hydrogen</em>', 'Bubbles of gas, straight off the metal', dur=2.8,
             cam=((0, 385, 620, 560), (1, 385, 620, 420))),
    ])

def molecule():
    s = S('molecule')
    return dict(kicker='Chemistry', accent='#B4552F', title='Molecule Builder', line='Build molecules atom by atom, with valence checks.', beats=[
        Beat(s, 0.4, 6.6, 'Build a molecule, <em>atom by atom</em>', 'Bonds snap in; the badges count what is still open', dur=3.4,
             cam=((0, 390, 620, 760), (1, 390, 640, 660))),
        Beat(s, 6.6, 9.4, 'Fill it in and <em>it knows the name</em>', 'Ethanol, the alcohol in drinks', dur=3.0,
             cam=((0, 390, 660, 660), (1, 390, 740, 760))),
    ])

def phase():
    s = S('phase')
    return dict(kicker='Material Science', accent='#8A6A3B', title='Phase Diagram', line='Drag temperature and pressure, watch substances change state.', beats=[
        Beat(s, 0.5, 4.6, 'Freeze water <em>with one drag</em>', 'Cross a line and the sample changes state', dur=3.0,
             cam=((0, 390, 480, 780), (1, 390, 470, 700))),
        Beat(s, 4.6, 9.2, 'Heat it into <em>a gas</em>', 'The vial shows what the water is doing', dur=3.0,
             cam=((0, 390, 470, 700), (1, 390, 480, 740))),
        Beat(s, 9.2, 12.0, 'Past the critical point: <em>neither</em>', 'Liquid and gas merge into one fluid', dur=2.6,
             cam=((0, 390, 480, 740), (1, 390, 440, 700))),
    ])

def cell():
    s = S('cell')
    return dict(kicker='Biology', accent='#3F7D4E', title='Cell Tour', line='Explore animal, plant and bacterial cells, part by part.', beats=[
        Beat(s, 0.4, 4.9, 'Tap a part, <em>bring it into focus</em>', 'Mitochondria, the Golgi, every organelle', dur=3.4,
             cam=((0, 390, 760, 780), (1, 390, 740, 720))),
        Beat(s, 5.1, 8.6, 'Then try <em>a plant cell</em>', 'The central vacuole keeps the plant rigid', dur=3.0,
             cam=((0, 390, 740, 720), (1, 390, 760, 780))),
    ])

def race():
    s = S('race')
    return dict(kicker='Computer Science', accent='#4E5D6A', title='Algorithm Race', line='Race sorting algorithms head to head, and hear them work.', beats=[
        Beat(s, 0.4, 3.0, 'This is what <em>sorting sounds like</em>', 'Every comparison plays the bar it touched', dur=2.8,
             cam=((0, 390, 900, 780), (1, 390, 920, 720))),
        Beat(s, 3.0, 8.4, 'Quicksort <em>finishes first</em>', 'Bubble sort is still swapping neighbors', dur=2.8,
             cam=((0, 390, 920, 720), (1, 390, 880, 760))),
        Beat(s, 8.4, 10.8, 'Bubble sort, <em>at last</em>', '1,020 steps against 254', dur=2.4,
             cam=((0, 390, 880, 760), (1, 390, 900, 700))),
    ])

def particle():
    s = S('particle')
    return dict(kicker='Physics', accent='#3A5BA0', title='Particle Sandbox', line='Fire beams at targets and watch collisions and decays.', beats=[
        Beat(s, 0.3, 2.4, 'Pick a beam <em>and a target</em>', 'Positrons into electrons at 30 GeV', dur=2.0,
             cam=((0, 390, 620, 780), (1, 390, 600, 720))),
        Beat(s, 2.4, 5.2, 'Smash them, <em>watch the tracks</em>', 'Quark and gluon jets fly out', dur=3.0,
             cam=((0, 390, 470, 760), (1, 390, 450, 660))),
        Beat(s, 7.6, 10.6, 'Now protons, <em>at the LHC</em>', 'Jets, and very rarely a Higgs', dur=3.2,
             cam=((0, 390, 470, 760), (1, 390, 460, 660))),
    ])

def cosmic():
    s = S('cosmic')
    return dict(kicker='Physics', accent='#3A5BA0', title='Cosmic Scale', line='Zoom from the Planck length to the observable universe.', beats=[
        Beat(s, 0.5, 6.2, 'Zoom out to <em>the edge of everything</em>', 'From the Eiffel Tower to the observable universe', dur=3.6,
             cam=((0, 390, 520, 760), (1, 390, 480, 660))),
        Beat(s, 7.6, 16.8, 'Then all the <em>way down</em>', 'Past atoms, to the Planck length', dur=4.2,
             cam=((0, 390, 480, 660), (1, 390, 520, 760))),
    ])

def pi():
    s = S('pi')
    return dict(kicker='Mathematics', accent='#5B4B9A', title='What If? Playground', line='Break the rules of math with interactive experiments.', beats=[
        Beat(s, 0.5, 4.0, 'What if <em>pi was 4?</em>', 'Measure distance differently and circles change shape', dur=3.0,
             cam=((0, 390, 840, 780), (1, 390, 830, 700))),
        Beat(s, 4.6, 10.6, 'Pi depends on <em>how you measure</em>', 'Diamond, circle, square', dur=3.4,
             cam=((0, 390, 830, 700), (1, 390, 840, 760))),
        Beat(s, 11.0, 13.2, 'Ordinary distance: <em>3.14159</em>', 'The smallest value on the dial', dur=2.2,
             cam=((0, 390, 840, 760), (1, 390, 820, 680))),
    ])

CUTS = {'evolution-sim': evolution, 'era-map': era_map, 'market-sim': market, 'trolley-lab': trolley,
        'reaction-bench': reaction, 'molecule-builder': molecule, 'phase-diagram': phase, 'cell-tour': cell,
        'algorithm-race': race, 'particle-sandbox': particle, 'cosmic-scale': cosmic, 'playground': pi}

for name in sys.argv[2:] or CUTS:
    c = CUTS[name]()
    render(c['beats'], os.path.join(OUT, f'nous-lab-{name}.mp4'), c['kicker'], c['accent'], c['title'], c['line'],
           os.path.join(REC, '_work', name))
