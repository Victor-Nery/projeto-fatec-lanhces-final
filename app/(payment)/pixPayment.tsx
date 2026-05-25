import BasePage from "@/components/BasePage";
import TextFont from '@/components/TextFont';
import useCart from '@/hooks/useCart';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from "expo-router";
import { createStaticPix } from 'pix-utils';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

export default function PixPayment() {
  const router = useRouter();
  const { total, loading: cartLoading, loadCart } = useCart();

  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutos

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const generatePix = useMemo(() => {
    if (!total || total <= 0) return null;
    try {
      return createStaticPix({
        pixKey: 'lizandra.ferrari@fatec.sp.gov.br',
        isTransactionUnique: true,
        merchantName: 'Lanches Fatec',
        merchantCity: 'MAUA',
        transactionAmount: total,
      }).throwIfError();
    } catch (err) {
      console.log('Erro ao gerar PIX:', err);
      return null;
    }
  }, [total]);

  const pix = generatePix ? generatePix.toBRCode() : '';

  const copyToClipboard = async () => {
    if (!pix) return;
    await Clipboard.setStringAsync(pix);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (cartLoading) {
    return (
      <BasePage title="Pagamento" subtitle="Conclua seu pagamento:">
        <View style={styles.options}><ActivityIndicator size="large" color="#B20000" /></View>
      </BasePage>
    );
  }

  return (
    <BasePage title="Pagamento" subtitle="Conclua seu pagamento:">
      <View style={styles.options}>
        <View style={styles.line}>
          <TextFont style={styles.price}>Total: R$ {Number(total ?? 0).toFixed(2).replace('.', ',')}</TextFont>
          <TouchableOpacity onPress={() => router.push('/cart')}>
            <TextFont style={{ fontSize: 20 }}>Voltar <Octicons name="undo" size={20} /></TextFont>
          </TouchableOpacity>
        </View>

        {total <= 0 ? (
          <View style={styles.info}>
            <TextFont style={styles.fail}>Carrinho vazio.</TextFont>
          </View>
        ) : timeLeft > 0 ? (
          <View style={{ alignItems: 'center' }}>
            <TextFont style={styles.copy}>Clique no código pix para copiar:</TextFont>
            <View style={styles.box}>
              <TouchableOpacity onPress={copyToClipboard} disabled={!pix}>
                <MaterialCommunityIcons style={styles.icon} name="clipboard-multiple-outline" size={20} color="black" />
                <TextFont selectable numberOfLines={10} ellipsizeMode="middle">{pix}</TextFont>
              </TouchableOpacity>
            </View>
            <TextFont style={styles.pix}>Tempo restante para pagamento: {time}</TextFont>
          </View>
        ) : (
          <View>
            <TextFont style={styles.fail}>QR code expirado!</TextFont>
          </View>
        )}
      </View>
    </BasePage>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 8,
    margin: 10,
    alignItems: 'center'
  },
  price: {
    color: '#b00000',
    fontSize: 24,
    fontFamily: 'Roboto_700Bold',
    textDecorationLine: 'underline',
  },
  box: {
    margin: 50,
    padding: 40,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    boxShadow: 'inset 0px 0px 10px rgba(0,0,0,0.5)',
  },
  line: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  icon: {
    right: 0,
    top: 0,
    position: 'absolute',
    margin: -25,
  },
  copy: {
    fontSize: 20,
    fontFamily: 'Roboto_400Regular',
  },
  pix: {
    color: '#b00000',
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
  },
  fail: {
    color: '#b00000',
    fontSize: 24,
    fontFamily: 'Roboto_700Bold',
    marginTop: 100,
  },
  info: {
    alignItems: 'center',
    marginTop: 40,
  },
});
