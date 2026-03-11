import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Alert,
  Animated, Keyboard, Share,
} from 'react-native';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  pageBg:        '#F1F5F9',
  cardBg:        '#FFFFFF',
  navy:          '#0F172A',
  navyMid:       '#1E293B',
  navyLight:     '#334155',
  amber:         '#F59E0B',
  textPrimary:   '#0F172A',
  textSecondary: '#475569',
  textMuted:     '#94A3B8',
  textWhite:     '#F8FAFC',
  inputBorder:   '#E2E8F0',
  inputBg:       '#F8FAFC',
  btnPrimary:    '#0F172A',
  btnCopy:       '#1E293B',
  btnReset:      '#FEF2F2',
  btnResetText:  '#EF4444',
  btnResetBorder:'#FECACA',
  catUltraLight: '#60A5FA',
  catLight:      '#34D399',
  catMedLight:   '#A78BFA',
  catMedium:     '#FBBF24',
  catHeavy:      '#F97316',
  catVeryHeavy:  '#EF4444',
};

// ─── Category Config ──────────────────────────────────────────────────────────
type GSMCategory = { label: string; use: string; abbr: string; color: string; bg: string };

const getGSMCategory = (gsm: number): GSMCategory => {
  if (gsm < 100)  return { label: 'Ultra Light', abbr: 'UL', use: 'Georgette, Chiffon, Voile',      color: C.catUltraLight, bg: '#EFF6FF' };
  if (gsm < 150)  return { label: 'Light',        abbr: 'L',  use: 'Sarees, Summer Shirts, Linings', color: C.catLight,      bg: '#ECFDF5' };
  if (gsm < 200)  return { label: 'Medium Light', abbr: 'ML', use: 'Dress Shirts, Kurtas, Blouses',  color: C.catMedLight,   bg: '#F5F3FF' };
  if (gsm < 250)  return { label: 'Medium',       abbr: 'M',  use: 'Trousers, Jackets, Bed Sheets',  color: C.catMedium,     bg: '#FFFBEB' };
  if (gsm < 350)  return { label: 'Heavy',        abbr: 'H',  use: 'Denim, Canvas, Upholstery',      color: C.catHeavy,      bg: '#FFF7ED' };
  return           { label: 'Very Heavy', abbr: 'VH', use: 'Industrial Fabric, Thick Canvas',  color: C.catVeryHeavy,  bg: '#FEF2F2' };
};

// ─── Scale Bar ────────────────────────────────────────────────────────────────
const ScaleBar = ({ gsm }: { gsm: number }) => {
  const pct = Math.min((gsm / 500) * 100, 100);
  return (
    <View style={sb.wrapper}>
      <View style={sb.track}>
        <View style={[sb.fill, { width: `${pct}%` as any }]} />
        <View style={[sb.thumb, { left: `${pct}%` as any }]} />
      </View>
      <View style={sb.ticks}>
        {['0', '100', '200', '350', '500+'].map(t => (
          <Text key={t} style={sb.tick}>{t}</Text>
        ))}
      </View>
    </View>
  );
};

const sb = StyleSheet.create({
  wrapper: { marginTop: 16, paddingHorizontal: 20 },
  track:   { height: 8, backgroundColor: C.inputBorder, borderRadius: 99, position: 'relative' },
  fill:    { height: 8, backgroundColor: C.amber, borderRadius: 99, position: 'absolute', left: 0 },
  thumb:   {
    width: 18, height: 18, borderRadius: 99,
    backgroundColor: C.amber, position: 'absolute', top: -5, marginLeft: -9,
    borderWidth: 3, borderColor: C.cardBg,
    elevation: 4, shadowColor: C.amber, shadowOpacity: 0.5, shadowRadius: 4,
  },
  ticks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  tick:  { fontSize: 10, color: C.textMuted },
});

// ─── Input Field ──────────────────────────────────────────────────────────────
const FIELD_PV = 16;
const FIELD_FS = 16;
const FIELD_LH = FIELD_FS * 1.25;

type IFProps = {
  label: string; unit: string; placeholder: string;
  value: string; onChangeText: (t: string) => void;
  optional?: boolean;
};

const InputField = ({ label, unit, placeholder, value, onChangeText, optional }: IFProps) => (
  <View style={f.wrapper}>
    <View style={f.labelRow}>
      <Text style={f.label}>{label}</Text>
      {optional && <Text style={f.optionalTag}>OPTIONAL</Text>}
    </View>
    <View style={f.row}>
      <TextInput
        style={f.input}
        placeholder={placeholder}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={C.inputBorder}
      />
      <View style={f.badge}>
        <Text style={f.badgeText}>{unit}</Text>
      </View>
    </View>
  </View>
);

const f = StyleSheet.create({
  wrapper:     { marginBottom: 16 },
  labelRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label:       { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  optionalTag: { marginLeft: 8, fontSize: 9, fontWeight: '700', color: C.amber, letterSpacing: 0.5, backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  row:         { flexDirection: 'row', alignItems: 'stretch' },
  input:       {
    flex: 1, borderWidth: 1.5, borderColor: C.inputBorder, borderRightWidth: 0,
    borderTopLeftRadius: 10, borderBottomLeftRadius: 10,
    paddingHorizontal: 14, paddingVertical: FIELD_PV,
    fontSize: FIELD_FS, lineHeight: FIELD_LH,
    color: C.textPrimary, backgroundColor: C.inputBg,
  },
  badge: {
    backgroundColor: C.navyLight, paddingHorizontal: 18, paddingVertical: FIELD_PV,
    borderTopRightRadius: 10, borderBottomRightRadius: 10,
    alignItems: 'center', justifyContent: 'center', minWidth: 52,
  },
  badgeText: { color: C.amber, fontWeight: '800', fontSize: 13, lineHeight: FIELD_LH, textTransform: 'uppercase' },
});

// ─── Reusable Result Block ────────────────────────────────────────────────────
type ResultBlockProps = {
  label: string; value: string; unit?: string;
  accentColor?: string; fadeAnim: Animated.Value;
  onShare: () => void; onReset: () => void;
  children?: React.ReactNode;
};

const ResultBlock = ({ label, value, unit, accentColor = C.amber, fadeAnim, onShare, onReset, children }: ResultBlockProps) => (
  <Animated.View style={[s.resultCard, { opacity: fadeAnim }]}>
    <View style={[s.resultAccent, { backgroundColor: accentColor }]} />
    <View style={{ padding: 20 }}>
      <Text style={s.gsmMeta}>{label}</Text>
      <Text style={s.gsmValue}>{value}<Text style={s.gsmUnit}>{unit ? ` ${unit}` : ''}</Text></Text>
      {children}
      <View style={s.actionRow}>
        <TouchableOpacity style={s.copyBtn} onPress={onShare} activeOpacity={0.8}>
          <Text style={s.copyBtnText}>Share Result</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.resetBtn} onPress={onReset} activeOpacity={0.8}>
          <Text style={s.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Animated.View>
);

// ─── Mode Type ────────────────────────────────────────────────────────────────
type Mode = 'gsm' | 'reverse' | 'cost' | 'convert';

const MODES: { key: Mode; label: string }[] = [
  { key: 'gsm',     label: 'GSM'     },
  { key: 'reverse', label: 'Reverse' },
  { key: 'cost',    label: 'Cost'    },
  { key: 'convert', label: 'Convert' },
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState<Mode>('gsm');

  // GSM mode
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width,  setWidth]  = useState('');
  const [result, setResult] = useState<number | null>(null);
  const fadeGSM = useRef(new Animated.Value(0)).current;

  // Reverse mode
  const [revGSM,     setRevGSM]     = useState('');
  const [revWeight,  setRevWeight]  = useState('');
  const [revLen,     setRevLen]     = useState('');
  const [revWid,     setRevWid]     = useState('');
  const [revResult,  setRevResult]  = useState<string | null>(null);
  const [revMissing, setRevMissing] = useState<'length' | 'width' | null>(null);
  const fadeRev = useRef(new Animated.Value(0)).current;

  // Cost mode
  const [costGSM,     setCostGSM]     = useState('');
  const [costWidth,   setCostWidth]   = useState('');
  const [costPriceKg, setCostPriceKg] = useState('');
  const [costResult,  setCostResult]  = useState<{ perMeter: number; perYard: number } | null>(null);
  const fadeCost = useRef(new Animated.Value(0)).current;

  // Convert mode
  const [convValue,  setConvValue]  = useState('');
  const [convType,   setConvType]   = useState<'m2y' | 'y2m' | 'gsm2oys' | 'oys2gsm'>('m2y');
  const [convResult, setConvResult] = useState<string | null>(null);
  const fadeConv = useRef(new Animated.Value(0)).current;

  const animate = (anim: Animated.Value) => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setWeight(''); setLength(''); setWidth(''); setResult(null);
    setRevGSM(''); setRevWeight(''); setRevLen(''); setRevWid(''); setRevResult(null); setRevMissing(null);
    setCostGSM(''); setCostWidth(''); setCostPriceKg(''); setCostResult(null);
    setConvValue(''); setConvResult(null);
  };

  // ── GSM ───────────────────────────────────────────────────────────────────
  const calcGSM = () => {
    Keyboard.dismiss();
    const w = parseFloat(weight), l = parseFloat(length), wd = parseFloat(width);
    if (!w || !l || !wd || w <= 0 || l <= 0 || wd <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for all fields.');
      return;
    }
    setResult(Math.round((w / (l * wd)) * 100) / 100);
    animate(fadeGSM);
  };

  const resetGSM = () => { setWeight(''); setLength(''); setWidth(''); setResult(null); };

  const shareGSM = async () => {
    if (result === null) return;
    const cat = getGSMCategory(result);
    await Share.share({
      message:
`📐 Fabric GSM Result
━━━━━━━━━━━━━━━━━━━━
GSM Value : ${result} g/m²
Category  : ${cat.label}
Best For  : ${cat.use}
━━━━━━━━━━━━━━━━━━━━
Weight: ${weight}g | Length: ${length}m | Width: ${width}m
— Fabric GSM Calculator`,
    });
  };

  // ── Reverse ───────────────────────────────────────────────────────────────
  const calcReverse = () => {
    Keyboard.dismiss();
    const gsm = parseFloat(revGSM);
    const w   = parseFloat(revWeight);
    const l   = parseFloat(revLen);
    const wd  = parseFloat(revWid);

    if (!gsm || gsm <= 0 || !w || w <= 0) {
      Alert.alert('Invalid Input', 'Target GSM and Fabric Weight are required.');
      return;
    }
    const hasL = !isNaN(l) && l > 0;
    const hasW = !isNaN(wd) && wd > 0;

    if (hasL && hasW) {
      Alert.alert('Leave one empty', 'Leave either Length or Width empty to calculate the missing dimension.');
      return;
    }
    if (!hasL && !hasW) {
      Alert.alert('Invalid Input', 'Enter at least one dimension (Length or Width).');
      return;
    }
    if (hasL) {
      setRevMissing('width');
      setRevResult(`${Math.round((w / (gsm * l)) * 100) / 100} m`);
    } else {
      setRevMissing('length');
      setRevResult(`${Math.round((w / (gsm * wd)) * 100) / 100} m`);
    }
    animate(fadeRev);
  };

  const resetReverse = () => {
    setRevGSM(''); setRevWeight(''); setRevLen(''); setRevWid('');
    setRevResult(null); setRevMissing(null);
  };

  const shareReverse = async () => {
    if (!revResult) return;
    await Share.share({
      message:
`📐 Fabric GSM Reverse Calc
━━━━━━━━━━━━━━━━━━━━
Target GSM : ${revGSM} g/m²
Weight     : ${revWeight} g
${revMissing === 'width'
  ? `Length     : ${revLen} m\nCalc Width : ${revResult}`
  : `Width      : ${revWid} m\nCalc Length: ${revResult}`}
— Fabric GSM Calculator`,
    });
  };

  // ── Cost ──────────────────────────────────────────────────────────────────
  // Cost per linear meter = (GSM × Width × Price/kg) ÷ 1000
  // Cost per linear yard  = Cost/meter × 0.9144
  const calcCost = () => {
    Keyboard.dismiss();
    const gsm   = parseFloat(costGSM);
    const w     = parseFloat(costWidth);
    const price = parseFloat(costPriceKg);

    if (!gsm || !w || !price || gsm <= 0 || w <= 0 || price <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive values for all fields.');
      return;
    }
    const perMeter = Math.round(((gsm * w * price) / 1000) * 100) / 100;
    const perYard  = Math.round(perMeter * 0.9144 * 100) / 100;
    setCostResult({ perMeter, perYard });
    animate(fadeCost);
  };

  const resetCost = () => { setCostGSM(''); setCostWidth(''); setCostPriceKg(''); setCostResult(null); };

  const shareCost = async () => {
    if (!costResult) return;
    await Share.share({
      message:
`💰 Fabric Cost Result
━━━━━━━━━━━━━━━━━━━━
GSM          : ${costGSM} g/m²
Width        : ${costWidth} m
Price/kg     : ₹${costPriceKg}
━━━━━━━━━━━━━━━━━━━━
Cost/meter   : ₹${costResult.perMeter}
Cost/yard    : ₹${costResult.perYard}
━━━━━━━━━━━━━━━━━━━━
Note: Cost is per linear meter/yard at entered width.
— Fabric GSM Calculator`,
    });
  };

  // ── Convert ───────────────────────────────────────────────────────────────
  const CONV_OPTIONS: { key: typeof convType; from: string; to: string; label: string }[] = [
    { key: 'm2y',     from: 'Meters', to: 'Yards',  label: 'M → Yd'    },
    { key: 'y2m',     from: 'Yards',  to: 'Meters', label: 'Yd → M'    },
    { key: 'gsm2oys', from: 'GSM',    to: 'OYS',    label: 'GSM → OYS' },
    { key: 'oys2gsm', from: 'OYS',    to: 'GSM',    label: 'OYS → GSM' },
  ];

  const doConvert = () => {
    Keyboard.dismiss();
    const v = parseFloat(convValue);
    if (!v || v <= 0) { Alert.alert('Invalid Input', 'Please enter a valid positive number.'); return; }
    let res = 0;
    switch (convType) {
      case 'm2y':     res = Math.round(v * 1.09361  * 10000) / 10000; break;
      case 'y2m':     res = Math.round(v * 0.9144   * 10000) / 10000; break;
      case 'gsm2oys': res = Math.round((v / 33.906) * 10000) / 10000; break;
      case 'oys2gsm': res = Math.round(v * 33.906   * 10000) / 10000; break;
    }
    setConvResult(`${res}`);
    animate(fadeConv);
  };

  const resetConv = () => { setConvValue(''); setConvResult(null); };

  const shareConv = async () => {
    if (!convResult) return;
    const opt = CONV_OPTIONS.find(o => o.key === convType)!;
    await Share.share({
      message:
`🔄 Textile Unit Conversion
━━━━━━━━━━━━━━━━━━━━
${opt.from.padEnd(10)}: ${convValue}
${opt.to.padEnd(10)}: ${convResult}
— Fabric GSM Calculator`,
    });
  };

  const cat     = result !== null ? getGSMCategory(result) : null;
  const convOpt = CONV_OPTIONS.find(o => o.key === convType)!;

  return (
    <ScrollView style={s.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor={C.navy} barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.iconBox}>
          <Text style={s.iconText}>GSM</Text>
        </View>
        <Text style={s.title}>Fabric GSM</Text>
        <Text style={s.subtitle}>C A L C U L A T O R</Text>
      </View>

      {/* Formula Strip */}
      <View style={s.formulaStrip}>
        <Text style={s.formulaText}>GSM  =  Weight (g)  ÷  ( Length × Width ) m²</Text>
      </View>

      {/* Mode Toggle */}
      <View style={s.modeRow}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[s.modeBtn, mode === m.key && s.modeBtnActive]}
            onPress={() => switchMode(m.key)}
            activeOpacity={0.85}>
            <Text style={[s.modeBtnText, mode === m.key && s.modeBtnTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ══════════════════════════════════════
          GSM MODE
      ══════════════════════════════════════ */}
      {mode === 'gsm' && (
        <>
          <View style={s.card}>
            <Text style={s.cardTitle}>Fabric Details</Text>
            <InputField label="Fabric Weight" unit="G" placeholder="e.g. 250" value={weight} onChangeText={setWeight} />
            <InputField label="Fabric Length" unit="M" placeholder="e.g. 1.5" value={length} onChangeText={setLength} />
            <InputField label="Fabric Width"  unit="M" placeholder="e.g. 1.2" value={width}  onChangeText={setWidth}  />
            <TouchableOpacity style={s.calcBtn} onPress={calcGSM} activeOpacity={0.85}>
              <Text style={s.calcBtnText}>Calculate GSM</Text>
            </TouchableOpacity>
          </View>

          {result !== null && cat && (
            <Animated.View style={[s.resultCard, { opacity: fadeGSM }]}>
              <View style={[s.resultAccent, { backgroundColor: cat.color }]} />
              <View style={s.resultTopRow}>
                <View>
                  <Text style={s.gsmMeta}>GSM VALUE</Text>
                  <Text style={s.gsmValue}>{result}<Text style={s.gsmUnit}> g/m²</Text></Text>
                </View>
                <View style={[s.abbrCircle, { backgroundColor: cat.bg, borderColor: cat.color }]}>
                  <Text style={[s.abbrText, { color: cat.color }]}>{cat.abbr}</Text>
                </View>
              </View>
              <ScaleBar gsm={result} />
              <View style={s.divider} />
              <View style={s.chipRow}>
                <View style={[s.chip, { backgroundColor: cat.bg, borderColor: cat.color }]}>
                  <Text style={[s.chipText, { color: cat.color }]}>{cat.label}</Text>
                </View>
              </View>
              <Text style={s.useLabel}>Best Suited For</Text>
              <Text style={s.useText}>{cat.use}</Text>
              <View style={s.actionRow}>
                <TouchableOpacity style={s.copyBtn} onPress={shareGSM} activeOpacity={0.8}>
                  <Text style={s.copyBtnText}>Share Result</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.resetBtn} onPress={resetGSM} activeOpacity={0.8}>
                  <Text style={s.resetBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* GSM Reference Table */}
          <View style={s.refCard}>
            <Text style={s.refTitle}>GSM Quick Reference</Text>
            {[
              { range: '< 100',     label: 'Ultra Light', eg: 'Chiffon, Georgette' },
              { range: '100 – 149', label: 'Light',        eg: 'Sarees, Linings'   },
              { range: '150 – 199', label: 'Medium Light', eg: 'Shirts, Kurtas'    },
              { range: '200 – 249', label: 'Medium',       eg: 'Trousers, Jackets' },
              { range: '250 – 349', label: 'Heavy',        eg: 'Denim, Canvas'     },
              { range: '350 +',     label: 'Very Heavy',   eg: 'Industrial Fabric' },
            ].map((row, i) => (
              <View key={i} style={[s.refRow, i % 2 === 0 && s.refRowAlt]}>
                <Text style={s.refRange}>{row.range}</Text>
                <Text style={s.refLabel}>{row.label}</Text>
                <Text style={s.refEg}>{row.eg}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ══════════════════════════════════════
          REVERSE MODE
      ══════════════════════════════════════ */}
      {mode === 'reverse' && (
        <>
          <View style={s.card}>
            <Text style={s.cardTitle}>Reverse Calculator</Text>
            <Text style={s.hint}>
              Enter Target GSM + Weight +{' '}
              <Text style={s.hintBold}>one dimension only</Text>.{'\n'}
              Leave the unknown dimension empty — it will be calculated.
            </Text>
            <InputField label="Target GSM"    unit="GSM" placeholder="e.g. 200" value={revGSM}    onChangeText={setRevGSM}    />
            <InputField label="Fabric Weight" unit="G"   placeholder="e.g. 300" value={revWeight} onChangeText={setRevWeight} />
            <InputField label="Fabric Length" unit="M"   placeholder="e.g. 1.5" value={revLen}    onChangeText={setRevLen}    optional />
            <InputField label="Fabric Width"  unit="M"   placeholder="e.g. 1.2" value={revWid}    onChangeText={setRevWid}    optional />
            <TouchableOpacity style={s.calcBtn} onPress={calcReverse} activeOpacity={0.85}>
              <Text style={s.calcBtnText}>Find Missing Dimension</Text>
            </TouchableOpacity>
          </View>

          {revResult !== null && (
            <ResultBlock
              label={revMissing === 'width' ? 'CALCULATED WIDTH' : 'CALCULATED LENGTH'}
              value={revResult}
              accentColor={C.amber}
              fadeAnim={fadeRev}
              onShare={shareReverse}
              onReset={resetReverse}>
              <View style={s.divider} />
              <Text style={s.useLabel}>What This Means</Text>
              <Text style={s.useText}>
                {revMissing === 'width'
                  ? `To achieve ${revGSM} GSM with ${revWeight}g over ${revLen}m length → width must be ${revResult}.`
                  : `To achieve ${revGSM} GSM with ${revWeight}g over ${revWid}m width → length must be ${revResult}.`}
              </Text>
            </ResultBlock>
          )}

          <View style={s.refCard}>
            <Text style={s.refTitle}>Formulas Used</Text>
            {[
              { case: 'Find Width',  formula: 'Width  = Weight ÷ (GSM × Length)' },
              { case: 'Find Length', formula: 'Length = Weight ÷ (GSM × Width)'  },
            ].map((row, i) => (
              <View key={i} style={[s.refRow, i % 2 === 0 && s.refRowAlt, { flexDirection: 'column', paddingVertical: 10 }]}>
                <Text style={[s.refRange, { width: '100%', marginBottom: 4 }]}>{row.case}</Text>
                <Text style={[s.refLabel, { fontFamily: 'monospace', fontSize: 11 }]}>{row.formula}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ══════════════════════════════════════
          COST MODE
      ══════════════════════════════════════ */}
      {mode === 'cost' && (
        <>
          <View style={s.card}>
            <Text style={s.cardTitle}>Fabric Cost Calculator</Text>
            <Text style={s.hint}>
              Enter GSM, fabric width, and price per kg to get{' '}
              <Text style={s.hintBold}>cost per linear meter and linear yard</Text>.{'\n'}
              <Text style={s.hintBold}>Assumes:</Text> price is per kg and width is fixed.
            </Text>
            <InputField label="Fabric GSM"      unit="GSM" placeholder="e.g. 200" value={costGSM}     onChangeText={setCostGSM}     />
            <InputField label="Fabric Width"     unit="M"   placeholder="e.g. 1.5" value={costWidth}   onChangeText={setCostWidth}   />
            <InputField label="Price per kg (₹)" unit="₹"   placeholder="e.g. 350" value={costPriceKg} onChangeText={setCostPriceKg} />
            <TouchableOpacity style={s.calcBtn} onPress={calcCost} activeOpacity={0.85}>
              <Text style={s.calcBtnText}>Calculate Cost</Text>
            </TouchableOpacity>
          </View>

          {costResult !== null && (
            <Animated.View style={[s.resultCard, { opacity: fadeCost }]}>
              <View style={[s.resultAccent, { backgroundColor: C.catLight }]} />
              <View style={{ padding: 20 }}>

                <Text style={s.gsmMeta}>COST PER LINEAR METER</Text>
                <Text style={s.gsmValue}>₹{costResult.perMeter}</Text>

                <View style={s.divider} />

                <Text style={s.gsmMeta}>COST PER LINEAR YARD</Text>
                <Text style={[s.gsmValue, { fontSize: 36 }]}>₹{costResult.perYard}</Text>

                <View style={s.divider} />

                <Text style={s.useLabel}>How It Was Calculated</Text>
                <Text style={s.useText}>
                  Cost/m = ({costGSM} × {costWidth} × ₹{costPriceKg}) ÷ 1000{'\n'}
                  Cost/yd = Cost/m × 0.9144
                </Text>

                {/* Assumption Note */}
                <View style={s.assumptionBox}>
                  <Text style={s.assumptionTitle}>📌 Assumption</Text>
                  <Text style={s.assumptionText}>
                    This cost is calculated for{' '}
                    <Text style={{ fontWeight: '700' }}>1 linear meter</Text> of fabric at the entered width.
                    If your supplier quotes price per running meter at a standard width, this result is directly applicable.
                    Results may vary if pricing structure differs.
                  </Text>
                </View>

                <View style={s.actionRow}>
                  <TouchableOpacity style={s.copyBtn} onPress={shareCost} activeOpacity={0.8}>
                    <Text style={s.copyBtnText}>Share Result</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.resetBtn} onPress={resetCost} activeOpacity={0.8}>
                    <Text style={s.resetBtnText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          <View style={s.refCard}>
            <Text style={s.refTitle}>Cost Formula</Text>
            {[
              { case: 'Per Meter', formula: '(GSM × Width × Price/kg) ÷ 1000' },
              { case: 'Per Yard',  formula: 'Cost/meter × 0.9144'              },
            ].map((row, i) => (
              <View key={i} style={[s.refRow, i % 2 === 0 && s.refRowAlt, { flexDirection: 'column', paddingVertical: 10 }]}>
                <Text style={[s.refRange, { width: '100%', marginBottom: 4 }]}>{row.case}</Text>
                <Text style={[s.refLabel, { fontFamily: 'monospace', fontSize: 11 }]}>{row.formula}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ══════════════════════════════════════
          CONVERT MODE
      ══════════════════════════════════════ */}
      {mode === 'convert' && (
        <>
          <View style={s.card}>
            <Text style={s.cardTitle}>Textile Unit Converter</Text>

            {/* Conversion type picker */}
            <View style={s.convTypeRow}>
              {CONV_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.convTypeBtn, convType === opt.key && s.convTypeBtnActive]}
                  onPress={() => { setConvType(opt.key); setConvResult(null); setConvValue(''); }}
                  activeOpacity={0.8}>
                  <Text style={[s.convTypeBtnText, convType === opt.key && s.convTypeBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InputField
              label={`Enter ${convOpt.from}`}
              unit={convOpt.from.substring(0, 3).toUpperCase()}
              placeholder="e.g. 200"
              value={convValue}
              onChangeText={v => { setConvValue(v); setConvResult(null); }}
            />

            <TouchableOpacity style={s.calcBtn} onPress={doConvert} activeOpacity={0.85}>
              <Text style={s.calcBtnText}>Convert</Text>
            </TouchableOpacity>
          </View>

          {convResult !== null && (
            <ResultBlock
              label={`RESULT IN ${convOpt.to.toUpperCase()}`}
              value={convResult}
              unit={convOpt.to}
              accentColor={C.catMedLight}
              fadeAnim={fadeConv}
              onShare={shareConv}
              onReset={resetConv}
            />
          )}

          <View style={s.refCard}>
            <Text style={s.refTitle}>Conversion Factors</Text>
            {[
              { from: '1 Meter', to: '1.09361 Yards'  },
              { from: '1 Yard',  to: '0.9144 Meters'  },
              { from: '1 GSM',   to: '0.02948 OYS'    },
              { from: '1 OYS',   to: '33.906 GSM'     },
            ].map((row, i) => (
              <View key={i} style={[s.refRow, i % 2 === 0 && s.refRowAlt]}>
                <Text style={s.refRange}>{row.from}</Text>
                <Text style={[s.refLabel, { color: C.amber }]}>→  {row.to}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.pageBg },

  // Header
  header:   { backgroundColor: C.navy, paddingTop: 56, paddingBottom: 36, alignItems: 'center' },
  iconBox:  { width: 72, height: 72, borderRadius: 20, backgroundColor: C.navyMid, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: C.navyLight },
  iconText: { color: C.amber, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  title:    { fontSize: 30, fontWeight: '800', color: C.textWhite, letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: C.amber, fontWeight: '600', letterSpacing: 4, marginTop: 4 },

  // Formula strip
  formulaStrip: { backgroundColor: C.navyMid, paddingVertical: 10, alignItems: 'center' },
  formulaText:  { fontSize: 12, color: C.amber, fontFamily: 'monospace' },

  // Mode toggle
  modeRow:           { flexDirection: 'row', margin: 16, marginBottom: 0, backgroundColor: C.navyMid, borderRadius: 12, padding: 4 },
  modeBtn:           { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  modeBtnActive:     { backgroundColor: C.amber },
  modeBtnText:       { fontSize: 11, fontWeight: '700', color: C.textMuted },
  modeBtnTextActive: { color: C.navy },

  // Cards
  card:      { backgroundColor: C.cardBg, margin: 16, borderRadius: 16, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 20 },

  // Hint
  hint:     { fontSize: 13, color: C.textSecondary, lineHeight: 20, marginBottom: 20, backgroundColor: '#FFFBEB', padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: C.amber },
  hintBold: { fontWeight: '700', color: C.amber },

  // Calculate button
  calcBtn:     { backgroundColor: C.btnPrimary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, elevation: 2 },
  calcBtnText: { color: C.amber, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  // Result card
  resultCard:   { backgroundColor: C.cardBg, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 },
  resultAccent: { height: 4 },
  resultTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 0 },
  gsmMeta:      { fontSize: 11, color: C.textMuted, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  gsmValue:     { fontSize: 48, fontWeight: '800', color: C.textPrimary, marginTop: 2 },
  gsmUnit:      { fontSize: 18, color: C.textSecondary, fontWeight: '400' },
  abbrCircle:   { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  abbrText:     { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  divider:      { height: 1, backgroundColor: C.pageBg, marginHorizontal: 20, marginVertical: 16 },

  // Chip
  chipRow:  { paddingHorizontal: 20, marginBottom: 8 },
  chip:     { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: '700' },

  useLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, marginTop: 4 },
  useText:  { fontSize: 14, color: C.textSecondary, paddingHorizontal: 20, marginTop: 4, lineHeight: 22 },

  // Action buttons
  actionRow:    { flexDirection: 'row', gap: 10, margin: 16 },
  copyBtn:      { flex: 1, backgroundColor: C.btnCopy, padding: 13, borderRadius: 10, alignItems: 'center' },
  copyBtnText:  { color: C.amber, fontWeight: '700', fontSize: 14 },
  resetBtn:     { flex: 1, backgroundColor: C.btnReset, padding: 13, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: C.btnResetBorder },
  resetBtnText: { color: C.btnResetText, fontWeight: '700', fontSize: 14 },

  // Reference table
  refCard:   { backgroundColor: C.cardBg, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 20, elevation: 2 },
  refTitle:  { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 14 },
  refRow:    { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8 },
  refRowAlt: { backgroundColor: C.pageBg },
  refRange:  { width: 90, fontSize: 12, color: C.amber, fontWeight: '700', fontFamily: 'monospace' },
  refLabel:  { flex: 1, fontSize: 12, color: C.textPrimary, fontWeight: '600' },
  refEg:     { flex: 1, fontSize: 12, color: C.textMuted, textAlign: 'right' },

  // Convert type selector
  convTypeRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  convTypeBtn:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: C.inputBg, borderWidth: 1.5, borderColor: C.inputBorder },
  convTypeBtnActive:     { backgroundColor: C.navyMid, borderColor: C.amber },
  convTypeBtnText:       { fontSize: 12, fontWeight: '700', color: C.textMuted },
  convTypeBtnTextActive: { color: C.amber },

  // Assumption box
  assumptionBox:   { backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, marginTop: 12, borderLeftWidth: 3, borderLeftColor: C.catLight },
  assumptionTitle: { fontSize: 12, fontWeight: '700', color: '#166534', marginBottom: 4 },
  assumptionText:  { fontSize: 12, color: '#15803D', lineHeight: 18 },
});
