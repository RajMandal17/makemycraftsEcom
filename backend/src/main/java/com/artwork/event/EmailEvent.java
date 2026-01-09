package com.artwork.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.Map;

@Getter
public class EmailEvent extends ApplicationEvent {
    private final String to;
    private final String subject;
    private final String templateName;
    private final Map<String, Object> variables;

    public EmailEvent(Object source, String to, String subject, String templateName, Map<String, Object> variables) {
        super(source);
        this.to = to;
        this.subject = subject;
        this.templateName = templateName;
        this.variables = variables;
    }


    //
}
