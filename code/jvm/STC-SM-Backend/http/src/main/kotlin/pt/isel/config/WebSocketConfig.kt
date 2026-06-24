package pt.isel.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig(
    @param:Value("\${app.cors.allowed-origins:http://localhost:*,http://127.0.0.1:*}")
    private val allowedOrigins: Array<String>,
) : WebSocketMessageBrokerConfigurer {
    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        // Chanel that spring uses to send messages to the frontend
        config.enableSimpleBroker("/topic")

        // Channel that spring uses to receive messages from the frontend
        config.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        // The place where the frontend connects with the channel itself
        registry
            .addEndpoint("/ws-simulator")
            .setAllowedOriginPatterns(*allowedOrigins)
    }
}
