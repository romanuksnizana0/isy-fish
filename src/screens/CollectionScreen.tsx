/**
 * The bucket: the five species of the season, discovered or still unknown.
 * Pressing a discovered card opens its detail panel in place.
 */
import React, {useState} from 'react';
import {Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ArrowLeft, ClipboardCheck, Fish} from 'lucide-react-native';
import {BOARD_W, PANEL_BOTTOM_PAD, SPECIES_COUNT} from '../constants/config';
import {iconHome} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import RoundIconButton from '../components/RoundIconButton';
import SpeciesCard from '../components/SpeciesCard';
import SecondaryButton from '../components/SecondaryButton';
import EmptyState from '../components/EmptyState';
import type {SpeciesRecord} from '../game/collection';
import {useLedger} from '../hooks/useLedger';
import {useScreenTransition} from '../hooks/useScreenTransition';
import {formatDay} from '../utils/format';

type Props = {
  onMenu: () => void;
  onExpedition: () => void;
};

const BLOBS = [
  {size: 230, color: 'rgba(127,232,197,0.22)', bottom: 90, right: -70},
  {size: 170, color: 'rgba(0,166,203,0.12)', top: -40, left: -50},
];

function DetailPanel({record}: {record: SpeciesRecord}) {
  const {opacity, translateY} = useScreenTransition();
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.detail,
        {opacity: opacity, transform: [{translateY: translateY}]},
      ]}>
      <Text style={styles.detailTitle}>{record.name}</Text>
      <Text style={styles.detailLine}>
        {'CAUGHT ' + record.count + ' TIME' + (record.count === 1 ? '' : 'S')}
      </Text>
      <Text style={styles.detailLine}>
        {'FIRST LOGGED ' +
          (record.firstDayIndex !== null ? formatDay(record.firstDayIndex) : '-')}
      </Text>
      <Text style={styles.detailLine}>
        {'USUAL WEATHER ' + (record.bestWeather ?? '-')}
      </Text>
      <Text style={styles.detailLine}>
        {'FIRST PIN ' + (record.firstPin ?? 'NO PIN YET')}
      </Text>
    </Animated.View>
  );
}

export default function CollectionScreen({onMenu, onExpedition}: Props) {
  const {opacity, translateY} = useScreenTransition();
  const collection = useLedger(s => s.collection);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const found = collection.filter(r => r.discovered).length;
  const open = openIndex !== null ? collection[openIndex] : null;

  return (
    <ScreenShell overlay={theme.gradients.collection} blobs={BLOBS}>
      <ScreenHeader
        title="CATCH COLLECTION"
        subtitle={found + '/' + SPECIES_COUNT + ' SPECIES IN THE BUCKET'}
        leftSlot={
          <RoundIconButton
            Icon={ArrowLeft}
            onPress={onMenu}
            accessibilityLabel="Back to home"
          />
        }
      />

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.body,
          {opacity: opacity, transform: [{translateY: translateY}]},
        ]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.board, {width: BOARD_W}]}>
            {collection.map(record => (
              <SpeciesCard
                key={record.name}
                index={record.index}
                name={record.name}
                count={record.count}
                discovered={record.discovered}
                height={146}
                hint={
                  record.discovered && record.firstDayIndex !== null
                    ? formatDay(record.firstDayIndex)
                    : record.discovered
                    ? 'LOGGED'
                    : 'LOCKED'
                }
                onPress={
                  record.discovered
                    ? () =>
                        setOpenIndex(prev =>
                          prev === record.index ? null : record.index,
                        )
                    : undefined
                }
              />
            ))}
          </View>

          {open ? <DetailPanel record={open} /> : null}

          {found === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                title="NOTHING IN THE BUCKET YET"
                hint="Every species is revealed by logging it on an expedition. Walk out, drill a hole and see what comes up."
                Icon={Fish}
                actionLabel="START EXPEDITION"
                ActionIcon={ClipboardCheck}
                onAction={onExpedition}
              />
            </View>
          ) : (
            <Text style={styles.footnote}>
              PRESS A REVEALED SPECIES FOR ITS RECORD
            </Text>
          )}
        </ScrollView>

        <SecondaryButton label="MENU" source={iconHome} onPress={onMenu} />
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: PANEL_BOTTOM_PAD,
  },
  scroll: {flex: 1},
  scrollInner: {paddingBottom: 12},
  board: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  detail: {
    marginTop: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  detailLine: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.6,
    color: theme.colors.text.secondary,
  },
  emptyWrap: {marginTop: 12},
  footnote: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.text.muted,
  },
});
