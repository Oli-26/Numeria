from labclip import Beat

def cuts(S):
    def cipher():
        s = S('cipher')
        cam = ((0, 390, 640, 700), (1, 390, 630, 660))
        return dict(kicker='Esoterica', accent='#5A4560', title='Cipher Decoder', line='Crack six classic ciphers, from Caesar to a layered puzzle.', beats=[
            Beat(s, 1.0, 3.6, 'Crack it and <em>the wheel turns</em>', 'Every letter rolls back three places', dur=2.8, cam=cam),
            Beat(s, 5.6, 8.8, 'Stuck? <em>Reveal it</em>', 'Atbash swaps A with Z, B with Y', dur=3.0,
                 cam=((0, 390, 630, 660), (1, 390, 640, 700))),
            Beat(s, 11.4, 14.6, 'Two ciphers, <em>two turns</em>', 'Undo the Atbash, then shift back five', dur=3.4,
                 cam=((0, 390, 640, 700), (1, 390, 620, 640))),
        ])

    def etymology():
        s = S('etymology')
        return dict(kicker='Linguistics', accent='#2E6F73', title='Etymology Tracer', line='Trace English words back to their oldest roots.', beats=[
            Beat(s, 0.5, 3.0, 'Trace a word <em>back in time</em>', 'Wheel, back to its Proto-Indo-European root', dur=2.6,
                 cam=((0, 390, 868, 650), (1, 390, 872, 630))),
            Beat(s, 3.7, 6.2, 'Tea took <em>two roads</em>', 'Tea by sea, chai overland', dur=2.6,
                 cam=((0, 390, 872, 630), (1, 390, 868, 640))),
            Beat(s, 6.9, 10.0, 'Every root has <em>cousins</em>', 'Star, stella, astronomy', dur=2.8,
                 cam=((0, 390, 868, 640), (1, 390, 868, 650))),
        ])

    def sound_shift():
        s = S('sound-shift')
        return dict(kicker='Linguistics', accent='#2E6F73', title='Sound Shift Sim', line='Run the sound laws that made English, rule by rule.', beats=[
            Beat(s, 0.5, 3.6, "Grimm's Law, <em>rule by rule</em>", 'PIE p became Germanic f, as in father', dur=3.0,
                 cam=((0, 390, 540, 680), (1, 390, 560, 620))),
            Beat(s, 4.1, 7.0, 'Then the <em>vowels moved</em>', 'Bite once rhymed with beet', dur=2.8,
                 cam=((0, 390, 560, 620), (1, 390, 550, 640))),
            Beat(s, 7.8, 11.8, 'Every step, <em>in order</em>', 'Name once sounded like nahm', dur=3.2,
                 cam=((0, 390, 550, 640), (1, 390, 560, 620))),
        ])

    return {'cipher-decoder': cipher, 'etymology': etymology, 'sound-shift': sound_shift}
