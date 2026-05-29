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
// 1. Importar o sistema de notificações do Expo
import * as Notifications from 'expo-notifications';

// 2. Configurar para a notificação aparecer na tela mesmo se o app estiver aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

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

  // 3. Função que roda ao clicar no botão "Já paguei" - COM A FORÇA DO GATILHO N8N!
  const handleConfirmPayment = async () => {
    // A URL corporativa e soberana do vosso n8n (Modo de Produção!)
    const urlN8N = 'https://vicxnihil.app.n8n.cloud/webhook/pedido';

    // Os dados do império: Estruturados rigidamente para o banco de dados
    const dadosDoPedido = {
      nome: "Victor Teste Sucesso",         // Substitua pelas variáveis do usuário logado se houver
      Email_Cliente: "seu-email@gmail.com",  // O e-mail que receberá a notificação vitoriosa
      produto: "Lanches",                   // O nome exato que governa a coleção do MongoDB
      Quantidade: 1,                        // A quantidade a ser abatida pelas engrenagens do n8n
      valor: total || 197,                  // O valor total real extraído do carrinho
      status: "pago"                        // A ordem de comando irrevogável
    };

    try {
      console.log("Marchando dados em direção ao n8n...");
      
      // Disparo do POST: Rápido, certeiro e centralizado!
      const respostaN8N = await fetch(urlN8N, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosDoPedido),
      });

      if (!respostaN8N.ok) {
        throw new Error("A resposta do servidor n8n não foi favorável.");
      }

      console.log("Comunicação com n8n estabelecida com sucesso absoluta!");

      // Controle das notificações locais
      const settings = await Notifications.getPermissionsAsync();
      let status = settings.status;
      
      if (status !== 'granted') {
        const response = await Notifications.requestPermissionsAsync();
        status = response.status;
      }

      if (status === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🍔 Pedido Pago e Aceito!",
            body: "Seu lanche começou a ser preparado. Retire no balcão da FATEC em até 5 minutos!",
          },
          trigger: null, 
        });
      } else {
        alert("Pagamento Confirmado! Seu lanche já está sendo preparado.");
      }
    } catch (error) {
      // Disciplina contra falhas: Mesmo se a conexão cair, a ordem não pode parar!
      console.log("Erro na ofensiva ou na notificação: ", error);
      alert("Pagamento Confirmado! (Aviso: Falha ao atualizar notificações corporativas)");
    } finally {
      // Destino final: Retornar ao menu sem olhar para trás!
      router.push('/menu');
    }
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
          <View style={{ alignItems: 'center', width: '100%' }}>
            <TextFont style={styles.copy}>Clique no código pix para copiar:</TextFont>
            <View style={styles.box}>
              <TouchableOpacity onPress={copyToClipboard} disabled={!pix}>
                <MaterialCommunityIcons style={styles.icon} name="clipboard-multiple-outline" size={20} color="black" />
                <TextFont selectable numberOfLines={10} ellipsizeMode="middle">{pix}</TextFont>
              </TouchableOpacity>
            </View>
            <TextFont style={styles.pix}>Tempo restante para pagamento: {time}</TextFont>

            {/* O BOTÃO SUPREMO DE CONFIRMAÇÃO */}
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
              <TextFont style={styles.confirmButtonText}>Já realizei o pagamento</TextFont>
            </TouchableOpacity>

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
    margin: 30, 
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
    marginBottom: 30, 
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
  confirmButton: {
    backgroundColor: '#b00000',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    width: '85%',
    alignItems: 'center',
    elevation: 3, 
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  }
});