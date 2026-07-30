import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Alert,
  Animated, Keyboard, Share, Platform, SafeAreaView,
} from 'react-native';

const BASE       = '#0B132B';
const BASE_DARK  = '#050A18';
const BASE_LIGHT = '#1C2541';

const T = {
  base: BASE, baseDark: BASE_DARK, baseLight: BASE_LIGHT,
  ink: '#F8FAFC', inkMid: '#E2E8F0', inkSoft: '#94A3B8', inkGhost: '#64748B',
  indigo: '#38BDF8', indigoBg: '#0369A130',
  rose:   '#34D399', roseBg:   '#065F4630',
  emerald:'#C084FC', emeraldBg:'#6B21A830',
  b1:'#38BDF8', b2:'#34D399', b3:'#A855F7',
  b4:'#FBBF24', b5:'#FB923C', b6:'#F43F5E',
};

const neu = (depth = 6) => ({
  shadowColor:  BASE_DARK,
  shadowOffset: { width: depth, height: depth },
  shadowOpacity: 0.9,
  shadowRadius:  depth * 1.5,
  elevation:     depth,
});
const neuInset = {
  backgroundColor: BASE,
  shadowColor:     BASE_DARK,
  shadowOffset:    { width: 2, height: 2 },
  shadowOpacity:   0.8,
  shadowRadius:    4,
  elevation:       0,
};

type Cat = { label: string; abbr: string; use: string; color: string; bg: string };
const getCat = (g: number): Cat => {
  if (g < 100) return { label:'Ultra Light', abbr:'UL', use:'Chiffon, Georgette, Voile',      color:T.b1, bg:'#0284C730' };
  if (g < 150) return { label:'Light',        abbr:'L',  use:'Sarees, Summer Shirts, Linings', color:T.b2, bg:'#05966930' };
  if (g < 200) return { label:'Medium Light', abbr:'ML', use:'Dress Shirts, Kurtas, Blouses',  color:T.b3, bg:'#7C3AED30' };
  if (g < 250) return { label:'Medium',       abbr:'M',  use:'Trousers, Jackets, Bed Sheets',  color:T.b4, bg:'#D9770630' };
  if (g < 350) return { label:'Heavy',        abbr:'H',  use:'Denim, Canvas, Upholstery',      color:T.b5, bg:'#EA580C30' };
  return         { label:'Very Heavy', abbr:'VH', use:'Industrial, Thick Canvas',       color:T.b6, bg:'#E11D4830' };
};

type Mode = 'cost' | 'gsm';
const TABS: { key: Mode; label: string; icon: string; accent: string }[] = [
  { key:'cost', label:'Cost',     icon:'◉', accent:T.emerald },
  { key:'gsm',  label:'GSM Calc', icon:'◈', accent:T.indigo  },
];

// ─── NEU CARD ──────────────────────────────────────────────────────────────────
const NeuCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[nc.card, style]}>{children}</View>
);
const nc = StyleSheet.create({
  card: {
    backgroundColor: BASE_LIGHT,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...neu(8),
  },
});

// ─── INPUT ─────────────────────────────────────────────────────────────────────
type NIPProps = {
  label: string; placeholder: string;
  value: string; onChangeText: (t: string) => void;
  unitLabel: string; accent: string; optional?: boolean;
};
const NeuInput = ({ label, placeholder, value, onChangeText, unitLabel, accent, optional }: NIPProps) => (
  <View style={ni.wrap}>
    <View style={ni.labelRow}>
      <Text style={ni.label}>{label}</Text>
      {optional && (
        <View style={[ni.optBadge, { backgroundColor: accent + '25', borderColor: accent + '50' }]}>
          <Text style={[ni.optText, { color: accent }]}>optional</Text>
        </View>
      )}
    </View>
    <View style={[ni.pill, neuInset]}>
      <TextInput
        style={ni.input}
        placeholder={placeholder}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={T.inkGhost}
        selectionColor={accent}
      />
      <View style={[ni.unitBubble, { backgroundColor: accent }]}>
        <Text style={ni.unitText}>{unitLabel}</Text>
      </View>
    </View>
  </View>
);
const ni = StyleSheet.create({
  wrap:       { marginBottom: 14 },
  labelRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 2 },
  label:      { fontSize: 11, fontWeight: '700', color: T.inkSoft, letterSpacing: 0.9, textTransform: 'uppercase' },
  optBadge:   { marginLeft: 8, borderRadius: 99, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 2 },
  optText:    { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  pill:       { flexDirection: 'row', alignItems: 'stretch', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  input:      { flex: 1, fontSize: 16, fontWeight: '600', color: T.ink, paddingVertical: 14, paddingHorizontal: 16 },
  unitBubble: { paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', minWidth: 62 },
  unitText:   { color: '#0B132B', fontWeight: '900', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
});

// ─── ACTION BUTTON ─────────────────────────────────────────────────────────────
const ActionBtn = ({ label, accent, onPress }: { label: string; accent: string; onPress: () => void }) => (
  <TouchableOpacity
    style={[ab.btn, { backgroundColor: accent }, neu(4)]}
    onPress={onPress}
    activeOpacity={0.85}>
    <Text style={ab.text}>{label}</Text>
  </TouchableOpacity>
);
const ab = StyleSheet.create({
  btn:  { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  text: { color: '#0B132B', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});

// ─── SCALE BAR ─────────────────────────────────────────────────────────────────
const ScaleBar = ({ gsm, color }: { gsm: number; color: string }) => {
  const pct = Math.min((gsm / 500) * 100, 100);
  return (
    <View style={skb.wrap}>
      <View style={[skb.track, { backgroundColor: BASE }]}>
        <View style={[skb.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
        <View style={[skb.knob, { left: `${pct}%` as any, backgroundColor: color, borderColor: BASE_LIGHT }]} />
      </View>
      <View style={skb.labels}>
        {['0', '100', '200', '350', '500'].map(l => (
          <Text key={l} style={skb.tick}>{l}</Text>
        ))}
      </View>
    </View>
  );
};
const skb = StyleSheet.create({
  wrap:  { marginTop: 16, marginBottom: 4 },
  track: { height: 8, borderRadius: 99, position: 'relative', overflow: 'visible' },
  fill:  { height: '100%' as any, borderRadius: 99, position: 'absolute', left: 0 },
  knob: {
    width: 20, height: 20, borderRadius: 10,
    position: 'absolute', top: -6, marginLeft: -10,
    borderWidth: 3, elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  tick:   { fontSize: 10, color: T.inkGhost, fontWeight: '600' },
});

// ─── STAT TILE ─────────────────────────────────────────────────────────────────
const StatTile = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <View style={[st.tile, { borderTopColor: accent }, neu(5)]}>
    <Text style={st.label}>{label}</Text>
    <Text style={[st.value, { color: accent }]}>{value}</Text>
  </View>
);
const st = StyleSheet.create({
  tile:  {
    flex: 1, backgroundColor: BASE, borderRadius: 18,
    borderTopWidth: 3, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14, paddingVertical: 16,
  },
  label: { fontSize: 10, fontWeight: '700', color: T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  value: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
});

// ─── REF ROW ───────────────────────────────────────────────────────────────────
const RefRow = ({ range, label, eg, color, alt }: { range: string; label: string; eg: string; color: string; alt: boolean }) => (
  <View style={[rr.row, alt && { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
    <View style={[rr.dot, { backgroundColor: color }]} />
    <Text style={[rr.range, { color }]}>{range}</Text>
    <Text style={rr.label}>{label}</Text>
    <Text style={rr.eg}>{eg}</Text>
  </View>
);
const rr = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10, marginBottom: 2 },
  dot:   { width: 9, height: 9, borderRadius: 99, marginRight: 12 },
  range: { width: 74, fontSize: 11, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  label: { flex: 1, fontSize: 12, fontWeight: '700', color: T.ink },
  eg:    { flex: 1, fontSize: 11, color: T.inkGhost, textAlign: 'right' },
});

// ─── DIVIDER ───────────────────────────────────────────────────────────────────
const Div = () => <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 16, borderRadius: 1 }} />;

// ─── BUTTON PAIR ───────────────────────────────────────────────────────────────
const BtnPair = ({ accent, onShare, onReset }: { accent: string; onShare: () => void; onReset: () => void }) => (
  <View style={bp.row}>
    <TouchableOpacity style={[bp.share, { borderColor: accent }]} onPress={onShare} activeOpacity={0.8}>
      <Text style={[bp.shareText, { color: accent }]}>↑  Share</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[bp.reset, neu(3)]} onPress={onReset} activeOpacity={0.8}>
      <Text style={bp.resetText}>↺  Reset</Text>
    </TouchableOpacity>
  </View>
);
const bp = StyleSheet.create({
  row:       { flexDirection: 'row', gap: 12, marginTop: 16 },
  share:     { flex: 1, borderWidth: 2, borderRadius: 14, paddingVertical: 13, alignItems: 'center', backgroundColor: BASE },
  shareText: { fontWeight: '800', fontSize: 14 },
  reset:     { flex: 1, backgroundColor: BASE, borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  resetText: { fontSize: 14, fontWeight: '700', color: T.inkSoft },
});

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [mode, setMode] = useState<Mode>('cost');

  const [wt,  setWt]  = useState('');
  const [ln,  setLn]  = useState('');
  const [wd,  setWd]  = useState('');
  const [gsm, setGsm] = useState<number | null>(null);
  const fadeG = useRef(new Animated.Value(0)).current;

  const [cGsm, setCGsm] = useState('');
  const [cWd,  setCWd]  = useState('');
  const [cPkg, setCPkg] = useState('');
  const [cRes, setCRes] = useState<{ m: number; y: number } | null>(null);
  const fadeC = useRef(new Animated.Value(0)).current;

  const pop = (a: Animated.Value) => {
    a.setValue(0);
    Animated.spring(a, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
  };

  const go = (m: Mode) => {
    setMode(m);
    setWt(''); setLn(''); setWd(''); setGsm(null);
    setCGsm(''); setCWd(''); setCPkg(''); setCRes(null);
  };

  const doGSM = () => {
    Keyboard.dismiss();
    const w = parseFloat(wt), l = parseFloat(ln), d = parseFloat(wd);
    if (!w || !l || !d || w <= 0 || l <= 0 || d <= 0) {
      Alert.alert('Missing Data', 'All three fields must have valid positive values.'); return;
    }
    setGsm(Math.round((w / (l * d)) * 100) / 100);
    pop(fadeG);
  };
  const resetGSM = () => { setWt(''); setLn(''); setWd(''); setGsm(null); };
  const shareGSM = async () => {
    if (gsm === null) return;
    const c = getCat(gsm);
    await Share.share({ message: `📐 TexMetrics Pro - GSM: ${gsm} g/m²\nCategory: ${c.label}\nBest Suited For: ${c.use}\nWeight: ${wt}g | Length: ${ln}m | Width: ${wd}m\n— TexMetrics Pro Suite` });
  };

  const doCost = () => {
    Keyboard.dismiss();
    const g = parseFloat(cGsm), w = parseFloat(cWd), p = parseFloat(cPkg);
    if (!g || !w || !p || g <= 0 || w <= 0 || p <= 0) {
      Alert.alert('Missing Data', 'All fields must have valid positive values.'); return;
    }
    const m = Math.round(((g * w * p) / 1000) * 100) / 100;
    setCRes({ m, y: Math.round(m * 0.9144 * 100) / 100 });
    pop(fadeC);
  };
  const resetCost = () => { setCGsm(''); setCWd(''); setCPkg(''); setCRes(null); };
  const shareCost = async () => {
    if (!cRes) return;
    await Share.share({ message: `💰 TexMetrics Pro - Cost Estimate\nGSM: ${cGsm} | Width: ${cWd}m | Price: ₹${cPkg}/kg\nCost/meter: ₹${cRes.m}\nCost/yard: ₹${cRes.y}\n— TexMetrics Pro Suite` });
  };

  const cat       = gsm !== null ? getCat(gsm) : null;
  const activeTab = TABS.find(t => t.key === mode)!;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar backgroundColor={BASE} barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={[s.headerIcon, { backgroundColor: activeTab.accent }, neu(4)]}>
          <Text style={s.headerIconText}>{activeTab.icon}</Text>
        </View>
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle}>TexMetrics Pro</Text>
          <Text style={[s.headerSub, { color: activeTab.accent }]}>{activeTab.label.toUpperCase()}</Text>
        </View>
        <View style={[s.formulaChip, { borderColor: activeTab.accent + '45', backgroundColor: activeTab.accent + '18' }]}>
          <Text style={[s.formulaChipText, { color: activeTab.accent }]}>{mode === 'cost' ? '₹/m' : 'W÷(L×W)'}</Text>
        </View>
      </View>

      {/* ── TAB BAR ── */}
      <View style={s.tabWrap}>
        <View style={[s.tabBar, neu(6)]}>
          {TABS.map(tab => {
            const active = mode === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  s.tabItem,
                  active && [s.tabItemActive, { backgroundColor: tab.accent + '22' }, neu(3)],
                ]}
                onPress={() => go(tab.key)}
                activeOpacity={0.8}>
                <Text style={[s.tabIcon, { color: active ? tab.accent : T.inkGhost }]}>{tab.icon}</Text>
                <Text style={[s.tabLabel, { color: active ? tab.accent : T.inkGhost }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── SCROLL ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ════════════════════════
            COST MODE (FIRST)
        ════════════════════════ */}
        {mode === 'cost' && (
          <>
            <View style={[s.heroBanner, { backgroundColor: T.emeraldBg, borderColor: T.emerald + '40' }]}>
              <Text style={[s.heroFormula, { color: T.emerald }]}>Cost/m = (GSM × Width × ₹/kg) ÷ 1000</Text>
            </View>

            <NeuCard style={s.card}>
              <View style={s.cardPad}>
                <Text style={s.cardHead}>Estimate Fabric Cost</Text>
                <NeuInput label="Fabric GSM"     unitLabel="GSM" placeholder="e.g. 200" value={cGsm} onChangeText={setCGsm} accent={T.emerald} />
                <NeuInput label="Fabric Width"    unitLabel="M"   placeholder="e.g. 1.5" value={cWd}  onChangeText={setCWd}  accent={T.emerald} />
                <NeuInput label="Price per kg ₹" unitLabel="₹"   placeholder="e.g. 350" value={cPkg} onChangeText={setCPkg} accent={T.emerald} />
                <ActionBtn label="Estimate Cost" accent={T.emerald} onPress={doCost} />
              </View>
            </NeuCard>

            {cRes !== null && (
              <Animated.View style={{
                opacity: fadeC,
                transform: [{ scale: fadeC.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
              }}>
                <NeuCard style={s.card}>
                  <View style={s.cardPad}>
                    <View style={s.dualRow}>
                      <StatTile label="Per Linear Meter" value={`₹${cRes.m}`} accent={T.emerald} />
                      <View style={{ width: 12 }} />
                      <StatTile label="Per Linear Yard"  value={`₹${cRes.y}`} accent={T.b4} />
                    </View>
                    <Div />
                    <View style={s.recapRow}>
                      {[{ k:'GSM', v:cGsm }, { k:'Width', v:`${cWd}m` }, { k:'₹/kg', v:`₹${cPkg}` }].map((item, i) => (
                        <React.Fragment key={item.k}>
                          {i > 0 && <View style={{ width: 10 }} />}
                          <View style={[s.miniTile, neu(3)]}>
                            <Text style={s.miniKey}>{item.k}</Text>
                            <Text style={[s.miniVal, { color: T.emerald }]}>{item.v}</Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>
                    <Div />
                    <View style={[s.noteBox, { backgroundColor: T.emeraldBg, borderColor: T.emerald + '40' }]}>
                      <Text style={[s.noteTitle, { color: T.emerald }]}>📌 Note</Text>
                      <Text style={s.noteBody}>
                        Cost applies to <Text style={{ fontWeight: '800', color: T.ink }}>1 linear meter</Text> at entered width.
                        Adjust if your supplier's pricing structure differs.
                      </Text>
                    </View>
                    <BtnPair accent={T.emerald} onShare={shareCost} onReset={resetCost} />
                  </View>
                </NeuCard>
              </Animated.View>
            )}

            <NeuCard style={s.card}>
              <View style={s.cardPad}>
                <Text style={s.cardHead}>Formula Reference</Text>
                {[
                  { c:'Per Meter', f:'(GSM × Width × Price/kg) ÷ 1000' },
                  { c:'Per Yard',  f:'Cost/meter × 0.9144'              },
                ].map((row, i) => (
                  <View key={i} style={[s.fRow, i % 2 !== 0 && { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                    <Text style={s.fCase}>{row.c}</Text>
                    <Text style={[s.fCode, { color: T.emerald }]}>{row.f}</Text>
                  </View>
                ))}
              </View>
            </NeuCard>
          </>
        )}

        {/* ════════════════════════
            GSM MODE (SECOND)
        ════════════════════════ */}
        {mode === 'gsm' && (
          <>
            <View style={[s.heroBanner, { backgroundColor: T.indigoBg, borderColor: T.indigo + '40' }]}>
              <Text style={[s.heroFormula, { color: T.indigo }]}>GSM  =  Weight (g)  ÷  ( Length × Width )</Text>
            </View>

            <NeuCard style={s.card}>
              <View style={s.cardPad}>
                <Text style={s.cardHead}>Enter Measurements</Text>
                <NeuInput label="Fabric Weight" unitLabel="G" placeholder="e.g. 250" value={wt} onChangeText={setWt} accent={T.indigo} />
                <NeuInput label="Fabric Length" unitLabel="M" placeholder="e.g. 1.5" value={ln} onChangeText={setLn} accent={T.indigo} />
                <NeuInput label="Fabric Width"  unitLabel="M" placeholder="e.g. 1.2" value={wd} onChangeText={setWd} accent={T.indigo} />
                <ActionBtn label="Calculate GSM" accent={T.indigo} onPress={doGSM} />
              </View>
            </NeuCard>

            {gsm !== null && cat && (
              <Animated.View style={{
                opacity: fadeG,
                transform: [{ scale: fadeG.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
              }}>
                <NeuCard style={s.card}>
                  <View style={[s.resultHero, { backgroundColor: cat.bg }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.eyebrow}>GSM VALUE</Text>
                      <Text style={[s.giantNum, { color: cat.color }]}>{gsm}</Text>
                      <Text style={[s.giantUnit, { color: cat.color }]}>grams / m²</Text>
                    </View>
                    <View style={[s.abbrBox, { backgroundColor: cat.color }, neu(4)]}>
                      <Text style={s.abbrBoxText}>{cat.abbr}</Text>
                    </View>
                  </View>
                  <View style={s.cardPad}>
                    <ScaleBar gsm={gsm} color={cat.color} />
                    <Div />
                    <View style={[s.catChip, { backgroundColor: cat.bg, borderColor: cat.color + '55' }]}>
                      <View style={[s.catDot, { backgroundColor: cat.color }]} />
                      <Text style={[s.catChipText, { color: cat.color }]}>{cat.label}</Text>
                    </View>
                    <Text style={s.useLabel}>BEST SUITED FOR</Text>
                    <Text style={s.useText}>{cat.use}</Text>
                    <Div />
                    <View style={s.recapRow}>
                      {[{ k:'Weight', v:`${wt} g` }, { k:'Length', v:`${ln} m` }, { k:'Width', v:`${wd} m` }].map((item, i) => (
                        <React.Fragment key={item.k}>
                          {i > 0 && <View style={{ width: 10 }} />}
                          <View style={[s.miniTile, neu(3)]}>
                            <Text style={s.miniKey}>{item.k}</Text>
                            <Text style={[s.miniVal, { color: T.indigo }]}>{item.v}</Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>
                    <BtnPair accent={cat.color} onShare={shareGSM} onReset={resetGSM} />
                  </View>
                </NeuCard>
              </Animated.View>
            )}

            <NeuCard style={s.card}>
              <View style={s.cardPad}>
                <Text style={s.cardHead}>GSM Reference Guide</Text>
                {[
                  { range:'< 100',   label:'Ultra Light', eg:'Chiffon, Voile',     color:T.b1 },
                  { range:'100–149', label:'Light',        eg:'Sarees, Linings',   color:T.b2 },
                  { range:'150–199', label:'Medium Light', eg:'Shirts, Kurtas',    color:T.b3 },
                  { range:'200–249', label:'Medium',       eg:'Trousers, Jackets', color:T.b4 },
                  { range:'250–349', label:'Heavy',        eg:'Denim, Canvas',     color:T.b5 },
                  { range:'350+',    label:'Very Heavy',   eg:'Industrial',        color:T.b6 },
                ].map((r, i) => <RefRow key={i} {...r} alt={i % 2 !== 0} />)}
              </View>
            </NeuCard>
          </>
        )}

        <View style={s.footer}>
          <Text style={s.footerBrand}>TexMetrics Pro</Text>
          <Text style={s.footerTagline}>Precision Textile & GSM Intelligence</Text>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BASE },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 8,
    paddingBottom: 14,
    backgroundColor: BASE,
  },
  headerIcon:     { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerIconText: { fontSize: 19, color: '#0B132B', fontWeight: '900' },
  headerTextWrap: { flex: 1 },
  headerTitle:    { fontSize: 18, fontWeight: '900', color: T.ink, letterSpacing: 0.2 },
  headerSub:      { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, marginTop: 1 },
  formulaChip:    { borderRadius: 99, borderWidth: 1.5, paddingHorizontal: 11, paddingVertical: 6 },
  formulaChipText:{ fontSize: 10, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  // ── Tab bar ──
  tabWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  tabBar: {
    flexDirection: 'row', backgroundColor: BASE_LIGHT,
    borderRadius: 20, padding: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tabItem:       { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 15, borderWidth: 1, borderColor: 'transparent' },
  tabItemActive: { },
  tabIcon:       { fontSize: 15, marginBottom: 3 },
  tabLabel:      { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },

  // ── Hero banner ──
  heroBanner: {
    borderRadius: 16, borderWidth: 1.5,
    paddingVertical: 12, paddingHorizontal: 16,
    alignItems: 'center', marginBottom: 14,
  },
  heroFormula: {
    fontSize: 12, fontWeight: '800', textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 0.3,
  },

  // ── Card layout ──
  card:    { marginBottom: 16, overflow: 'hidden' },
  cardPad: { padding: 20 },
  cardHead:{ fontSize: 15, fontWeight: '900', color: T.ink, marginBottom: 18, letterSpacing: 0.2 },

  // ── Result hero ──
  resultHero: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 16 },
  eyebrow:    { fontSize: 10, fontWeight: '800', color: T.inkSoft, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  giantNum:   { fontSize: 68, fontWeight: '900', lineHeight: 74, letterSpacing: -2 },
  giantUnit:  { fontSize: 13, fontWeight: '600', marginTop: 2, color: T.inkSoft },
  abbrBox:    { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 14 },
  abbrBoxText:{ color: '#0B132B', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

  // ── Category chip ──
  catChip:    { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 14 },
  catDot:     { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  catChipText:{ fontSize: 13, fontWeight: '800' },

  // ── Detail text ──
  useLabel: { fontSize: 10, fontWeight: '800', color: T.inkGhost, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  useText:  { fontSize: 14, fontWeight: '500', color: T.inkMid, lineHeight: 21 },

  // ── Recap row ──
  recapRow: { flexDirection: 'row' },
  miniTile: { flex: 1, backgroundColor: BASE, borderRadius: 13, paddingVertical: 11, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  miniKey:  { fontSize: 9, fontWeight: '800', color: T.inkGhost, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  miniVal:  { fontSize: 15, fontWeight: '900' },

  // ── Dual stat row ──
  dualRow: { flexDirection: 'row' },

  // ── Note box ──
  noteBox:   { borderRadius: 14, borderWidth: 1.5, padding: 14 },
  noteTitle: { fontSize: 12, fontWeight: '800', marginBottom: 5 },
  noteBody:  { fontSize: 13, color: T.inkMid, lineHeight: 19 },

  // ── Formula rows ──
  fRow:  { paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, marginBottom: 2 },
  fCase: { fontSize: 10, fontWeight: '800', color: T.inkSoft, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  fCode: { fontSize: 13, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 20 },

  // ── Footer ──
  footer: { alignItems: 'center', marginTop: 16, marginBottom: 12 },
  footerBrand: { fontSize: 14, fontWeight: '900', color: T.inkSoft, letterSpacing: 1 },
  footerTagline: { fontSize: 11, fontWeight: '600', color: T.inkGhost, marginTop: 2, letterSpacing: 0.3 },
});
